import { createHmac,createHash,randomBytes } from "node:crypto";
import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { z } from "zod";
import { LicenseDomainError,type AppScope,type Principal } from "./contracts";
import type { AppStore } from "./transaction-store";
import { assertCapability } from "../auth/permissions";
import { assertFresh } from "../auth/staff";
import { encryptValue,decryptValue,safeEqual } from "../security/secrets";
import { audit } from "./apps";
import { reduceGrants } from "./entitlements";
import type { AccessRecord,GrantRecord } from "./access-records";
import type { AppInput } from "./contracts";
export const webhookEvents=["redeemed","expired","revoked","restored","extended","paused","resumed","transferred","redemption-undone","device-added","device-removed","credential-rotated"] as const;
export function verifyWebhook(body:Uint8Array,timestamp:number,signature:string,secret:string,now:Date):boolean{if(!Number.isInteger(timestamp)||Math.abs(now.getTime()/1000-timestamp)>300||!/^[a-f0-9]{64}$/.test(signature))return false;return safeEqual(createHmac("sha256",secret).update(`${timestamp}.`).update(body).digest("hex"),signature);}
export function isPublicAddress(input:string):boolean{
 const address=input.toLowerCase();if(!isIP(address))return false;
 if(address.includes(":"))return !address.startsWith("::")&&!/^(fc|fd|fe[89ab]|ff)/.test(address)&&!address.startsWith("2001:db8:");
 const [a,b,c]=address.split(".").map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a===198&&[18,19].includes(b)||a===192&&b===0||a===198&&b===51&&c===100||a===203&&b===0&&c===113);
}
type Resolver=(hostname:string)=>Promise<{address:string;family:number}[]>;
const resolve:Resolver=hostname=>lookup(hostname,{all:true,verbatim:true});
export async function checkWebhookTarget(value:string,resolver:Resolver=resolve){const url=new URL(value);if(url.protocol!=="https:"||url.username||url.password||url.hash||url.port&&url.port!=="443")throw new LicenseDomainError("unsafe_webhook_target");const hostname=url.hostname.replace(/^\[|\]$/g,"");if(hostname==="localhost"||hostname.endsWith(".localhost")||hostname.endsWith(".local"))throw new LicenseDomainError("unsafe_webhook_target");const addresses=isIP(hostname)?[{address:hostname,family:isIP(hostname)}]:await resolver(hostname);if(!addresses.length||addresses.some(a=>!isPublicAddress(a.address)))throw new LicenseDomainError("unsafe_webhook_target");return {url,address:addresses[0]};}
export async function createWebhook(store:AppStore,principal:Principal,scope:AppScope,input:unknown,now:Date,resolver:Resolver=resolve):Promise<{id:string;secret:string}>{
 assertCapability(principal,"integrations.write",scope);assertFresh(principal,now);const parsed=z.object({url:z.url().max(2000),events:z.array(z.enum(webhookEvents)).min(1).max(20)}).strict().parse(input);await checkWebhookTarget(parsed.url,resolver);const secret=randomBytes(32).toString("hex");
 return store.transaction(async tx=>{const [row]=await tx.query<{id:string}>("INSERT INTO license_webhooks(app_id,environment,url,secret_ciphertext,events) VALUES($1,$2,$3,$4,$5) RETURNING id",[scope.appId,scope.environment,parsed.url,encryptValue(secret),JSON.stringify(parsed.events)]);await audit(tx,principal,"webhook.created",scope.appId,row.id,{},scope.environment);return {id:row.id,secret};});
}
export type WebhookTransport=(url:string,body:Uint8Array,headers:Record<string,string>)=>Promise<number>;
export const sendPinnedWebhook:WebhookTransport=async(value,body,headers)=>{
 const target=await checkWebhookTarget(value);
 return new Promise<number>((resolve,reject)=>{
  // The checked address is pinned into the connection; a second DNS answer cannot rebind it.
  const request=httpsRequest(target.url,{method:"POST",headers,servername:target.url.hostname,lookup:(_hostname,_options,callback)=>callback(null,target.address.address,target.address.family)},response=>{let bytes=0;response.on("data",chunk=>{bytes+=chunk.length;if(bytes>65536){response.destroy();reject(new Error("response_too_large"));}});response.on("error",reject);response.on("end",()=>{const status=response.statusCode??0;if(status>=300&&status<400)return reject(new Error("redirect_refused"));resolve(status);});});
  request.setTimeout(5000,()=>request.destroy(new Error("delivery_timeout")));request.on("error",reject);request.end(body);
 });
};
function expiryId(licenseId:string,date:string){const bytes=createHash("sha256").update(`expiry:${licenseId}:${date}`).digest().subarray(0,16);bytes[6]=(bytes[6]&15)|80;bytes[8]=(bytes[8]&63)|128;const hex=bytes.toString("hex");return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;}
async function enqueueExpiries(store:AppStore,now:Date){await store.transaction(async tx=>{
 const rows=await tx.query<AccessRecord&{config:AppInput}>("SELECT l.*,a.config FROM access_licenses l JOIN license_apps a ON a.id=l.app_id JOIN LATERAL (SELECT max(g.expires_at) deadline,bool_or(g.expires_at IS NULL) permanent FROM access_grants g WHERE g.license_id=l.id AND g.undone_at IS NULL AND g.input->>'type'<>'bundle') lifetime ON true WHERE l.paused_at IS NULL AND l.revoked_at IS NULL AND NOT lifetime.permanent AND lifetime.deadline+make_interval(hours=>(a.config->>'expiryGraceHours')::int)<=$1 AND NOT EXISTS(SELECT 1 FROM license_outbox e WHERE e.license_id=l.id AND e.type='expired' AND (e.payload->>'expiresAt')::timestamptz=lifetime.deadline) ORDER BY lifetime.deadline,l.id LIMIT 100",[now]);
 for(const row of rows){const grants=await tx.query<GrantRecord>("SELECT * FROM access_grants WHERE license_id=$1 AND undone_at IS NULL ORDER BY plan_priority DESC",[row.id]),access=reduceGrants({appId:row.app_id,environment:row.environment},row,grants,row.config,"jobs",now);if(access.status==="expired"&&access.expiresAt)await tx.query("INSERT INTO license_outbox(id,app_id,environment,type,license_id,payload) VALUES($1,$2,$3,'expired',$4,$5) ON CONFLICT(id) DO NOTHING",[expiryId(row.id,access.expiresAt),row.app_id,row.environment,row.id,JSON.stringify({licenseId:row.id,expiresAt:access.expiresAt})]);}
 });}
type Delivery={id:string;event_id:string;webhook_id:string;attempts:number;url:string;secret_ciphertext:string;type:string;payload:Record<string,unknown>;app_id:string;environment:string};
export async function runLicenseJobs(store:AppStore,now:Date,limit=20,transport:WebhookTransport=sendPinnedWebhook):Promise<{processed:number;failed:number}>{
 await enqueueExpiries(store,now);
 await store.transaction(async tx=>{
  const events=await tx.query<{id:string}>("SELECT id FROM license_outbox WHERE processed_at IS NULL ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED");
  for(const event of events){await tx.query("INSERT INTO license_deliveries(event_id,webhook_id,next_attempt_at) SELECT e.id,w.id,$2 FROM license_outbox e JOIN license_webhooks w ON w.app_id=e.app_id AND w.environment=e.environment WHERE e.id=$1 AND w.enabled AND w.events ? e.type ON CONFLICT(event_id,webhook_id) DO NOTHING",[event.id,now]);await tx.query("UPDATE license_outbox SET processed_at=$2 WHERE id=$1",[event.id,now]);}
  await tx.query("DELETE FROM license_rate_buckets WHERE expires_at<$1 AND (locked_until IS NULL OR locked_until<$1)",[now]);
 });
 const deliveries=await store.transaction(async tx=>{
  const claimed=await tx.query<{id:string}>("SELECT d.id FROM license_deliveries d JOIN license_webhooks w ON w.id=d.webhook_id WHERE w.enabled AND d.next_attempt_at<=$1 AND (d.status='pending' OR d.status='processing' AND d.leased_until<$1) ORDER BY d.next_attempt_at LIMIT $2 FOR UPDATE OF d SKIP LOCKED",[now,Math.min(100,Math.max(1,limit))]);
  if(!claimed.length)return [] as Delivery[];
  await tx.query("UPDATE license_deliveries SET status='processing',leased_until=$2,attempts=attempts+1 WHERE id=ANY($1::uuid[])",[claimed.map(c=>c.id),new Date(now.getTime()+120000)]);
  return tx.query<Delivery>("SELECT d.*,w.url,w.secret_ciphertext,e.type,e.payload,e.app_id,e.environment FROM license_deliveries d JOIN license_webhooks w ON w.id=d.webhook_id JOIN license_outbox e ON e.id=d.event_id WHERE d.id=ANY($1::uuid[])",[claimed.map(c=>c.id)]);
 });
 let processed=0,failed=0;
 for(let index=0;index<deliveries.length;index+=5)await Promise.all(deliveries.slice(index,index+5).map(async delivery=>{
  const timestamp=Math.floor(now.getTime()/1000),body=Buffer.from(JSON.stringify({id:delivery.event_id,type:delivery.type,appId:delivery.app_id,environment:delivery.environment,data:delivery.payload})),signature=createHmac("sha256",decryptValue(delivery.secret_ciphertext)).update(`${timestamp}.`).update(body).digest("hex");let status=0,error:string|null=null;
  try{status=await transport(delivery.url,body,{"content-type":"application/json","content-length":String(body.length),"keygate-event-id":delivery.event_id,"keygate-timestamp":String(timestamp),"keygate-signature":signature});if(status<200||status>=300)error=`http_${status}`;}catch{error="delivery_failed";}
  const delays=[300,3600,21600,86400],next=new Date(now.getTime()+(delays[delivery.attempts-1]??86400)*1000);
  await store.transaction(tx=>tx.query("UPDATE license_deliveries SET status=$2,response_code=$3,last_error=$4,next_attempt_at=$5,leased_until=NULL,delivered_at=$6 WHERE id=$1 AND status='processing'",[delivery.id,error?(delivery.attempts>=5?"failed":"pending"):"delivered",status||null,error,next,error?null:now]));processed++;if(error)failed++;
 }));
 await store.transaction(tx=>tx.query("INSERT INTO license_job_runs(kind,result) VALUES('delivery',$1)",[JSON.stringify({processed,failed})]));return {processed,failed};
}
