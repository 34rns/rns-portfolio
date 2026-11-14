import { z } from "zod";
import type { AppStore } from "./transaction-store";
import { parseScope, runAdminCommand } from "./admin-commands";
import { LicenseDomainError, type Principal } from "./contracts";
import { assertCapability } from "../auth/permissions";
import { assertFresh } from "../auth/staff";
import { lookupHash, encryptValue, decryptValue } from "../security/secrets";

const capabilities: Record<string,string> = {
 "app.create":"apps.create", "app.save":"apps.write", "app.archive":"apps.write",
 "codes.issue":"codes.generate", "batch.start":"codes.generate", "batch.process":"codes.generate", "batch.cancel":"codes.generate", "preset.save":"codes.generate", "campaign.create":"codes.generate",
 "codes.import.preview":"codes.read", "codes.import":"codes.generate", "codes.export":"codes.export", "codes.bulk":"codes.write", "view.save":"codes.read", "code.revoke":"codes.write",
 "license.action":"licenses.write", "license.note":"notes.write", "device.reset":"licenses.write", "license.recover":"secrets.reveal", "codes.reveal":"secrets.reveal",
 "key.create":"security.write", "key.revoke":"security.write", "webhook.create":"integrations.write", "webhook.disable":"integrations.write", "webhook.rotate":"integrations.write", "delivery.retry":"integrations.write",
 "team.invite":"team.write", "team.update":"team.write", "integration.check":"notes.write",
};
const fresh = new Set(["license.recover","codes.reveal","key.create","key.revoke","webhook.create","webhook.rotate","team.invite","team.update"]);

export async function runJournaledCommand(store:AppStore,principal:Principal,command:string,scopeValue:unknown,data:unknown,idempotency:string,now=new Date()) {
 const key=z.string().trim().min(1).max(128).parse(idempotency), scope=scopeValue?parseScope(scopeValue):undefined;
 const ownSetting=["preferences.save","totp.begin","totp.confirm"].includes(command);
 if(ownSetting){if(principal.kind!=="staff")throw new LicenseDomainError("forbidden",403);}
 else {
  const capability=command==="license.action" && (data as {action?:unknown})?.action==="transfer"?"licenses.transfer":capabilities[command];
  if(!capability)throw new LicenseDomainError("unknown_command",404);
  assertCapability(principal,capability,scope);
 }
 if(fresh.has(command)||ownSetting&&command.startsWith("totp.")||command==="codes.export"&&(data as {reveal?:boolean})?.reveal||command==="codes.bulk"&&(data as {action?:string})?.action==="restore"){
  if(command==="codes.export"||command==="codes.bulk")assertCapability(principal,"secrets.reveal",scope);
  assertFresh(principal,now);
 }
 const hash=lookupHash(JSON.stringify(["admin-command",principal.kind,principal.id,scope??null,command,key]));
 const requestHash=lookupHash(JSON.stringify(data));
 return store.transaction(async tx=>{
  await tx.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",[hash]);
  const [existing]=await tx.query<{request_hash:string;response_ciphertext:string;expires_at:Date}>("SELECT request_hash,response_ciphertext,expires_at FROM license_command_requests WHERE hash=$1",[hash]);
  if(existing){
   if(existing.expires_at<=now)throw new LicenseDomainError("idempotency_expired",409);
   if(existing.request_hash!==requestHash)throw new LicenseDomainError("idempotency_conflict",409);
   return JSON.parse(decryptValue(existing.response_ciphertext));
  }
  const transactional:AppStore={read:fn=>fn(tx),transaction:fn=>fn(tx)};
  const result=await runAdminCommand(transactional,principal,command,scope,data,now);
  const serialized=JSON.stringify(result??null);
  await tx.query("INSERT INTO license_command_requests(hash,actor_id,app_id,environment,request_hash,response_ciphertext,created_at,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",[hash,principal.id,scope?.appId??null,scope?.environment??null,requestHash,encryptValue(serialized),now,new Date(now.getTime()+7*86400000)]);
  return JSON.parse(serialized);
 });
}
