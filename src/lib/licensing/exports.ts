import { z } from "zod";
import type { AppStore, SqlExecutor } from "./transaction-store";
import { type Principal, type AppScope, LicenseDomainError, generateCodesSchema } from "./contracts";
import { assertCapability } from "../auth/permissions";
import { assertFresh } from "../auth/staff";
import { codeLookup, normalizeRedeemCode } from "./code-crypto";
import { encryptValue, decryptValue } from "../security/secrets";
import { readApp, audit } from "./apps";

export function csvCell(value:unknown){let text=String(value??"");if(/^[\s]*[=+@\-\t\r]/.test(text))text="'"+text;return `"${text.replaceAll('"','""')}"`;}
export function parseCsv(text:string):string[][]{
 if(Buffer.byteLength(text)>5*1024*1024)throw new LicenseDomainError("import_too_large",413);
 const rows:string[][]=[],row:string[]=[];let cell="",quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const char=text[i];if(quoted){if(char==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=char;continue;}
  if(char==='"'){if(cell||closed)throw new LicenseDomainError("invalid_csv");quoted=true;}
  else if(char===','){row.push(cell);cell="";closed=false;}
  else if(char==='\n'||char==='\r'){if(char==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.length))rows.push([...row]);row.length=0;cell="";closed=false;if(rows.length>10001)throw new LicenseDomainError("import_too_many_rows");}
  else{if(closed)throw new LicenseDomainError("invalid_csv");cell+=char;}
 }
 if(quoted)throw new LicenseDomainError("invalid_csv");row.push(cell);if(row.some(v=>v.length))rows.push(row);if(rows.length>10001)throw new LicenseDomainError("import_too_many_rows");return rows;
}
type ImportRow={key:string;input:z.infer<typeof generateCodesSchema>};
async function preview(tx:SqlExecutor,scope:AppScope,csv:string){
 const [head,...data]=parseCsv(csv.replace(/^\uFEFF/,""));if(!head||!head.includes("key")||new Set(head).size!==head.length||head.some(h=>!["key","type","plan","duration_seconds","calendar_months","max_uses","max_devices","redeem_by","note"].includes(h)))throw new LicenseDomainError("invalid_csv_headers");
 if(!data.length)throw new LicenseDomainError("empty_import");const app=await readApp(tx,scope.appId,true);if(app.archived_at)throw new LicenseDomainError("app_archived",410);
 const errors:string[]=[],items:ImportRow[]=[],seen=new Set<string>();
 for(const [i,row] of data.entries()){
  try{if(row.length!==head.length)throw new Error("column count");const record=Object.fromEntries(head.map((h,j)=>[h,row[j]])),key=normalizeRedeemCode(record.key);if(!key||new Set(key.replaceAll("-","").slice(key.indexOf("-")+1)).size<6)throw new Error("invalid or low-entropy key");if(seen.has(key))throw new Error("duplicate code");seen.add(key);
   const input=generateCodesSchema.parse({type:record.type||"lifetime",planKey:record.plan||"pro",prefix:key.split("-")[0],count:1,note:record.note||"",...(record.duration_seconds?{durationSeconds:Number(record.duration_seconds)}:{}),...(record.calendar_months?{calendarMonths:Number(record.calendar_months)}:{}),...(record.max_uses?{maxRedemptions:Number(record.max_uses)}:{}),...(record.max_devices?{maxDevices:Number(record.max_devices)}:{}),...(record.redeem_by?{redeemBy:record.redeem_by}:{})});
   if(!app.config.plans.some(p=>p.key===input.planKey))throw new Error("unknown plan");items.push({key,input});
  }catch(error){errors.push(`Row ${i+2}: ${error instanceof z.ZodError?"invalid duration, plan or limits":error instanceof Error?error.message:"invalid row"}`);}
 }
 if(items.length){const existing=await tx.query<{key_lookup:string}>("SELECT key_lookup FROM redeem_codes WHERE key_lookup=ANY($1::text[])",[items.map(i=>codeLookup(scope,i.key))]);if(existing.length)errors.push(`${existing.length} duplicate existing code(s)`);}
 return {items,errors,app};
}
export async function previewCodeImport(store:AppStore,principal:Principal,scope:AppScope,csv:string){assertCapability(principal,"codes.generate",scope);return store.transaction(async tx=>{const result=await preview(tx,scope,csv);return {count:result.items.length,errors:result.errors,rows:result.items.slice(0,20).map(i=>({masked:`${i.input.prefix}-••••-••••-••••-${i.key.slice(-4)}`,type:i.input.type,plan:i.input.planKey}))};});}
export async function importCodes(store:AppStore,principal:Principal,scope:AppScope,csv:string,now:Date){
 assertCapability(principal,"codes.generate",scope);return store.transaction(async tx=>{const result=await preview(tx,scope,csv);if(result.errors.length)throw new LicenseDomainError("import_validation_failed");
  for(let start=0;start<result.items.length;start+=100){const rows=result.items.slice(start,start+100).map(({key,input})=>({app_id:scope.appId,environment:scope.environment,key_lookup:codeLookup(scope,key),key_ciphertext:encryptValue(key),masked:`${input.prefix}-••••-••••-••••-${key.slice(-4)}`,grant:{type:input.type,planKey:input.planKey,featureKeys:result.app.config.plans.find(p=>p.key===input.planKey)!.featureKeys,stackable:input.stackable,...(input.durationSeconds?{durationSeconds:input.durationSeconds}:{}),...(input.calendarMonths?{calendarMonths:input.calendarMonths}:{})},max_redemptions:input.maxRedemptions,max_devices:input.maxDevices??result.app.config.maxDevices,redeem_by:input.redeemBy??null,note:input.note}));
   await tx.query('INSERT INTO redeem_codes(app_id,environment,key_lookup,key_ciphertext,masked,"grant",max_redemptions,max_devices,redeem_by,note) SELECT app_id,environment,key_lookup,key_ciphertext,masked,"grant",max_redemptions,max_devices,redeem_by,note FROM jsonb_to_recordset($1::jsonb) AS x(app_id uuid,environment text,key_lookup text,key_ciphertext text,masked text,"grant" jsonb,max_redemptions integer,max_devices integer,redeem_by timestamptz,note text)',[JSON.stringify(rows)]);
  }await audit(tx,principal,"codes.imported",scope.appId,null,{count:result.items.length,at:now.toISOString()},scope.environment);return {imported:result.items.length};
 });
}
export async function exportCodes(store:AppStore,principal:Principal,scope:AppScope,format:"csv"|"json",reveal:boolean,now:Date){
 assertCapability(principal,"codes.export",scope);if(reveal){assertCapability(principal,"secrets.reveal",scope);assertFresh(principal,now);}
 return store.transaction(async tx=>{const rows=await tx.query<{id:string;masked:string;key_ciphertext:string;environment:string;grant:unknown;redemption_count:number;max_redemptions:number;note:string}>(`SELECT id,masked,${reveal?"key_ciphertext":"NULL::text AS key_ciphertext"},environment,"grant",redemption_count,max_redemptions,note FROM redeem_codes WHERE app_id=$1 AND environment=$2 ORDER BY created_at,id LIMIT 10001`,[scope.appId,scope.environment]);if(rows.length>10000)throw new LicenseDomainError("export_limit_exceeded");await audit(tx,principal,"codes.exported",scope.appId,null,{count:rows.length,reveal,format},scope.environment);
  const clean=rows.map(({key_ciphertext,...r})=>({...r,...(reveal?{key:decryptValue(key_ciphertext)}:{})}));if(format==="json")return JSON.stringify(clean,null,2);
  const headers=["id","masked",...(reveal?["key"]:[]),"environment","grant","redemption_count","max_redemptions","note"];return [headers.join(","),...clean.map(r=>headers.map(k=>csvCell(k==="grant"?JSON.stringify(r.grant):r[k as keyof typeof r])).join(","))].join("\r\n");
 });
}
