import { z } from "zod";
import type { AppStore } from "./transaction-store";
import { assertCapability } from "../auth/permissions";
import { type Principal,type AppScope,type Page,type AppInput,type AccessSnapshot } from "./contracts";
import type { AccessRecord,GrantRecord,CodeRecord } from "./access-records";
import { reduceGrants,loadLicense,snapshot } from "./entitlements";
export const pageNumber=(value:unknown)=>z.coerce.number().int().min(1).max(10000).catch(1).parse(value);
export type CodeRow=Omit<CodeRecord,"key_ciphertext">&{app_name:string;batch_id:string|null;campaign_id:string|null};
export async function codePage(store:AppStore,principal:Principal,scope:AppScope|null,filter:{page?:unknown;query?:string;status?:string;campaign?:string}={}):Promise<Page<CodeRow>>{
 assertCapability(principal,"codes.read",scope??undefined);const page=pageNumber(filter.page),query=(filter.query??"").slice(0,100),status=["available","used","revoked","deadline"].includes(filter.status??"")?filter.status:"all";
 return store.read(async tx=>{
  const params=[scope?.appId??null,scope?.environment??null,principal.role==="owner"?null:principal.appIds,`%${query}%`,status,filter.campaign&&z.uuid().safeParse(filter.campaign).success?filter.campaign:null,principal.environments];
  const where="($1::uuid IS NULL OR c.app_id=$1) AND ($2::text IS NULL OR c.environment=$2) AND ($3::uuid[] IS NULL OR c.app_id=ANY($3)) AND (c.masked ILIKE $4 OR c.note ILIKE $4) AND ($5='all' OR $5='revoked' AND c.revoked_at IS NOT NULL OR $5='used' AND c.redemption_count>=c.max_redemptions OR $5='deadline' AND c.redeem_by<=now() OR $5='available' AND c.revoked_at IS NULL AND c.redemption_count<c.max_redemptions AND (c.redeem_by IS NULL OR c.redeem_by>now())) AND ($6::uuid IS NULL OR c.campaign_id=$6) AND c.environment=ANY($7::text[])";
  const [{count}]=await tx.query<{count:string}>(`SELECT count(*) FROM redeem_codes c WHERE ${where}`,params);
  const items=await tx.query<CodeRow>(`SELECT c.id,c.app_id,c.environment,c.masked,c."grant",c.redemption_count,c.max_redemptions,c.max_devices,c.redeem_by,c.revoked_at,c.note,c.created_at,c.batch_id,c.campaign_id,a.name AS app_name FROM redeem_codes c JOIN license_apps a ON a.id=c.app_id WHERE ${where} ORDER BY c.created_at DESC,c.id LIMIT 50 OFFSET $8`,[...params,(page-1)*50]);
  return {items,total:Number(count),nextCursor:Number(count)>page*50?String(page+1):null};
 });
}
export type AccessRow=AccessSnapshot&{appName:string;subject:string|null;note:string;createdAt:Date;deviceCount:number};
export async function accessPage(store:AppStore,principal:Principal,scope:AppScope|null,filter:{page?:unknown;query?:string}={}):Promise<Page<AccessRow>>{
 assertCapability(principal,"licenses.read",scope??undefined);const page=pageNumber(filter.page);
 return store.read(async tx=>{
  const params=[scope?.appId??null,scope?.environment??null,principal.role==="owner"?null:principal.appIds,`%${(filter.query??"").slice(0,100)}%`,principal.environments];
  const where="($1::uuid IS NULL OR l.app_id=$1) AND ($2::text IS NULL OR l.environment=$2) AND ($3::uuid[] IS NULL OR l.app_id=ANY($3)) AND (l.id::text ILIKE $4 OR l.subject ILIKE $4 OR l.note ILIKE $4) AND l.environment=ANY($5::text[])";
  const [{count}]=await tx.query<{count:string}>(`SELECT count(*) FROM access_licenses l WHERE ${where}`,params);
  const rows=await tx.query<AccessRecord&{app_name:string;config:AppInput;device_count:string}>(`SELECT l.*,a.name AS app_name,a.config,(SELECT count(*) FROM access_devices d WHERE d.license_id=l.id AND d.deactivated_at IS NULL) AS device_count FROM access_licenses l JOIN license_apps a ON a.id=l.app_id WHERE ${where} ORDER BY l.created_at DESC,l.id LIMIT 50 OFFSET $6`,[...params,(page-1)*50]);
  const grants=rows.length?await tx.query<GrantRecord>("SELECT * FROM access_grants WHERE license_id=ANY($1::uuid[]) AND undone_at IS NULL ORDER BY plan_priority DESC,created_at,id",[rows.map(r=>r.id)]):[];
  return {items:rows.map(row=>({...reduceGrants({appId:row.app_id,environment:row.environment},row,grants.filter(g=>g.license_id===row.id),row.config,"admin-inspection",new Date()),appName:row.app_name,subject:row.subject,note:row.note,createdAt:row.created_at,deviceCount:Number(row.device_count)})),total:Number(count),nextCursor:Number(count)>page*50?String(page+1):null};
 });
}
export async function licenseDetail(store:AppStore,principal:Principal,scope:AppScope,id:string){assertCapability(principal,"licenses.read",scope);return store.read(async tx=>{const record=await loadLicense(tx,scope,id);const access=await snapshot(tx,scope,record,"admin-inspection",new Date());const devices=await tx.query<{id:string;name:string;deactivated_at:Date|null;last_seen:Date}>("SELECT id,name,deactivated_at,last_seen FROM access_devices WHERE license_id=$1 ORDER BY first_seen",[id]);const grants=await tx.query<GrantRecord&{redemption_id:string;masked:string}>("SELECT g.*,r.id AS redemption_id,c.masked FROM access_grants g LEFT JOIN code_redemptions r ON r.code_id=g.code_id AND r.license_id=g.license_id LEFT JOIN redeem_codes c ON c.id=g.code_id WHERE g.license_id=$1 ORDER BY g.created_at DESC",[id]);return {record:{id:record.id,subject:record.subject,note:record.note,maxDevices:record.max_devices},access,devices,grants};});}
export async function activityPage(store:AppStore,principal:Principal,page:unknown=1){assertCapability(principal,"activity.read");return store.read(tx=>tx.query<{id:string;action:string;actor_id:string;created_at:Date;target_id:string|null;app_id:string|null;environment:string|null;detail:Record<string,unknown>}>("SELECT * FROM admin_audit_events WHERE ($1::uuid[] IS NULL OR app_id=ANY($1)) AND (environment IS NULL OR environment=ANY($3::text[])) ORDER BY created_at DESC LIMIT 50 OFFSET $2",[principal.role==="owner"?null:principal.appIds,(pageNumber(page)-1)*50,principal.environments]));}
