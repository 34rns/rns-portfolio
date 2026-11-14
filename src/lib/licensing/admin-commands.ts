import { z } from "zod";
import { environmentSchema,LicenseDomainError,type Principal,type AppScope } from "./contracts";
import type { AppStore } from "./transaction-store";
import { assertCapability } from "../auth/permissions";
import { assertFresh,createStaffInvite,updateStaff } from "../auth/staff";
import { beginTotp,confirmTotp } from "../auth/totp";
import { createApp,saveApp,archiveApp,audit } from "./apps";
import { issueCodes,applyLicenseAction } from "./access";
import { startCodeBatch,processCodeBatch,cancelCodeBatch } from "./batches";
import { createAppKey,revokeAppKey } from "./api-keys";
import { activationKey } from "./code-crypto";
import { activationLookup,loadLicense,recordEvent } from "./entitlements";
import { encryptValue,decryptValue } from "../security/secrets";
import { importCodes,previewCodeImport,exportCodes } from "./exports";
const scopeParser=z.object({appId:z.uuid(),environment:environmentSchema}).strict();
export const parseScope=(value:unknown):AppScope=>scopeParser.parse(value);
const idParser=z.uuid();
export async function runAdminCommand(store:AppStore,principal:Principal,command:string,scopeValue:unknown,data:unknown,now=new Date()):Promise<unknown>{
 const scope=scopeValue?parseScope(scopeValue):undefined;
 const scoped=()=>{if(!scope)throw new LicenseDomainError("scope_required");return scope;};
 switch(command){
  case "app.create": return createApp(store,principal,data);
  case "codes.import.preview": return previewCodeImport(store,principal,scoped(),z.string().max(5*1024*1024).parse(data));
  case "codes.import": return importCodes(store,principal,scoped(),z.string().max(5*1024*1024).parse(data),now);
  case "codes.export": {const input=z.object({format:z.enum(["csv","json"]),reveal:z.boolean().default(false)}).strict().parse(data);return exportCodes(store,principal,scoped(),input.format,input.reveal,now);}
  case "codes.bulk": {
   assertCapability(principal,"codes.write",scoped());const input=z.object({ids:z.array(idParser).min(1).max(10000),action:z.enum(["revoke","restore","deadline","tag"]),reason:z.string().trim().min(1).max(1000),redeemBy:z.iso.datetime().optional(),campaignId:idParser.nullable().optional()}).strict().parse(data);
   if(input.action==="restore"){assertCapability(principal,"secrets.reveal",scoped());assertFresh(principal,now);}
   return store.transaction(async tx=>{if(input.campaignId&&!(await tx.query("SELECT id FROM redeem_campaigns WHERE id=$1 AND app_id=$2 AND environment=$3",[input.campaignId,scoped().appId,scoped().environment])).length)throw new LicenseDomainError("invalid_campaign");
    const assignment=input.action==="revoke"?"revoked_at=now()":input.action==="restore"?"revoked_at=NULL":input.action==="deadline"?"redeem_by=$4::timestamptz":"campaign_id=$4::uuid";
    if(input.action==="deadline"&&!input.redeemBy)throw new LicenseDomainError("deadline_required");
    const rows=await tx.query<{id:string}>(`UPDATE redeem_codes SET ${assignment} WHERE app_id=$1 AND environment=$2 AND id=ANY($3::uuid[]) RETURNING id`,[scoped().appId,scoped().environment,input.ids,...(["deadline","tag"].includes(input.action)?[input.action==="deadline"?input.redeemBy:input.campaignId??null]:[])]);
    await audit(tx,principal,`codes.bulk.${input.action}`,scoped().appId,null,{count:rows.length,reason:input.reason},scoped().environment);return {updated:rows.length};
   });
  }
  case "view.save": {
   assertCapability(principal,"codes.read",scoped());const input=z.object({name:z.string().trim().min(1).max(80),query:z.string().max(100),status:z.enum(["all","available","used","revoked","deadline"])}).strict().parse(data);return store.transaction(tx=>tx.query("INSERT INTO admin_saved_views(member_id,resource,name,filters) VALUES($1,'codes',$2,$3) RETURNING id",[principal.id,input.name,JSON.stringify({...input,appId:scoped().appId,environment:scoped().environment})]));
  }
  case "app.save": return saveApp(store,principal,scoped().appId,data);
  case "app.archive": return archiveApp(store,principal,scoped().appId);
  case "codes.issue": return issueCodes(store,principal,scoped(),data);
  case "batch.start": {const input=z.object({input:z.unknown(),key:z.string().min(1).max(128)}).strict().parse(data);return startCodeBatch(store,principal,scoped(),input.input,input.key);}
  case "batch.process": return processCodeBatch(store,principal,scoped(),idParser.parse(data));
  case "batch.cancel": return cancelCodeBatch(store,principal,scoped(),idParser.parse(data));
  case "code.revoke": {
   const input=z.object({id:idParser,reason:z.string().trim().min(1).max(1000)}).strict().parse(data);assertCapability(principal,"codes.write",scoped());
   return store.transaction(async tx=>{await tx.query("UPDATE redeem_codes SET revoked_at=now() WHERE id=$1 AND app_id=$2 AND environment=$3",[input.id,scoped().appId,scoped().environment]);await audit(tx,principal,"code.revoked",scoped().appId,input.id,{reason:input.reason},scoped().environment);});
  }
  case "license.action": return applyLicenseAction(store,principal,scoped(),z.object({licenseId:idParser,action:z.enum(["pause","resume","revoke","restore","extend","undo","transfer"]),reason:z.string().trim().min(1).max(1000),redemptionId:idParser.optional(),seconds:z.number().int().optional(),targetSubject:z.string().max(256).optional()}).strict().parse(data),now);
  case "license.note": {
   const input=z.object({licenseId:idParser,note:z.string().max(1000)}).strict().parse(data);assertCapability(principal,"notes.write",scoped());return store.transaction(async tx=>{await loadLicense(tx,scoped(),input.licenseId,true);await tx.query("UPDATE access_licenses SET note=$2 WHERE id=$1",[input.licenseId,input.note]);await audit(tx,principal,"license.note",scoped().appId,input.licenseId,{},scoped().environment);});
  }
  case "device.reset": {
   const input=z.object({licenseId:idParser,deviceRecordId:idParser,reason:z.string().trim().min(1).max(1000)}).strict().parse(data);assertCapability(principal,"licenses.write",scoped());
   return store.transaction(async tx=>{await loadLicense(tx,scoped(),input.licenseId,true);const changed=await tx.query("UPDATE access_devices SET deactivated_at=$3 WHERE id=$1 AND license_id=$2 AND deactivated_at IS NULL RETURNING id",[input.deviceRecordId,input.licenseId,now]);if(changed.length){await tx.query("UPDATE access_licenses SET revision=revision+1 WHERE id=$1",[input.licenseId]);await recordEvent(tx,scoped(),input.licenseId,"device-removed",{reason:input.reason},principal);}});
  }
  case "license.recover": {
   const input=z.object({licenseId:idParser,reason:z.string().trim().min(1).max(1000)}).strict().parse(data);assertCapability(principal,"secrets.reveal",scoped());assertFresh(principal,now);const key=activationKey();await store.transaction(async tx=>{await loadLicense(tx,scoped(),input.licenseId,true);await tx.query("UPDATE access_licenses SET activation_lookup=$2,activation_ciphertext=$3,min_token_revision=revision+1,revision=revision+1 WHERE id=$1",[input.licenseId,activationLookup(scoped(),key),encryptValue(key)]);await tx.query("UPDATE license_return_tickets SET used_at=$2 WHERE license_id=$1 AND used_at IS NULL",[input.licenseId,now]);await recordEvent(tx,scoped(),input.licenseId,"credential-rotated",{reason:input.reason},principal);});return {activationKey:key};
  }
  case "key.create": assertFresh(principal,now);return createAppKey(store,principal,scoped(),data);
  case "key.revoke": assertFresh(principal,now);return revokeAppKey(store,principal,scoped(),idParser.parse(data));
  case "webhook.create": return (await import("./webhooks")).createWebhook(store,principal,scoped(),data,now);
  case "webhook.disable": {assertCapability(principal,"integrations.write",scoped());const id=idParser.parse(data);return store.transaction(async tx=>{await tx.query("UPDATE license_webhooks SET enabled=false WHERE id=$1 AND app_id=$2 AND environment=$3",[id,scoped().appId,scoped().environment]);await audit(tx,principal,"webhook.disabled",scoped().appId,id,{},scoped().environment);});}
  case "webhook.rotate": {assertCapability(principal,"integrations.write",scoped());assertFresh(principal,now);const id=idParser.parse(data),secret=activationKey()+activationKey();await store.transaction(async tx=>{await tx.query("UPDATE license_webhooks SET previous_secret_ciphertext=secret_ciphertext,previous_secret_until=$4,secret_ciphertext=$5 WHERE id=$1 AND app_id=$2 AND environment=$3",[id,scoped().appId,scoped().environment,new Date(now.getTime()+300000),encryptValue(secret)]);await audit(tx,principal,"webhook.rotated",scoped().appId,id,{},scoped().environment);});return {secret};}
  case "delivery.retry": {assertCapability(principal,"integrations.write",scoped());const id=idParser.parse(data);return store.transaction(tx=>tx.query("UPDATE license_deliveries d SET status='pending',next_attempt_at=now(),attempts=0,leased_until=NULL FROM license_webhooks w WHERE d.id=$1 AND d.webhook_id=w.id AND w.app_id=$2 AND w.environment=$3 AND d.status='failed'",[id,scoped().appId,scoped().environment]));}
  case "team.invite": return createStaffInvite(store,principal,data,now);
  case "team.update": {const input=z.object({id:idParser,changes:z.unknown()}).strict().parse(data);return updateStaff(store,principal,input.id,input.changes as Parameters<typeof updateStaff>[3],now);}
  case "totp.begin": return beginTotp(store,principal,now);
  case "totp.confirm": return confirmTotp(store,principal,z.string().regex(/^\d{6}$/).parse(data),now);
  case "integration.check": {
   assertCapability(principal,"notes.write",scoped());const input=z.object({step:z.enum(["redeem","activate","validate","expiry","deactivate","backend"]),evidence:z.string().trim().min(20).max(2000),passed:z.boolean()}).strict().parse(data);return store.transaction(tx=>tx.query("INSERT INTO license_integration_checks(app_id,environment,actor_id,step,evidence,passed) VALUES($1,$2,$3,$4,$5,$6)",[scoped().appId,scoped().environment,principal.id,input.step,input.evidence,input.passed]));
  }
  case "preset.save": case "campaign.create": {
   assertCapability(principal,"codes.generate",scoped());const input=z.object({name:z.string().trim().min(1).max(100),data:z.unknown().optional(),note:z.string().max(1000).optional()}).strict().parse(data);
   return store.transaction(async tx=>command==="preset.save"?tx.query("INSERT INTO redeem_presets(app_id,environment,name,data) VALUES($1,$2,$3,$4) RETURNING id",[scoped().appId,scoped().environment,input.name,JSON.stringify(input.data??{})]):tx.query("INSERT INTO redeem_campaigns(app_id,environment,name,note) VALUES($1,$2,$3,$4) RETURNING id",[scoped().appId,scoped().environment,input.name,input.note??""]));
  }
  case "codes.reveal": {
   assertCapability(principal,"secrets.reveal",scoped());assertFresh(principal,now);const ids=z.array(idParser).min(1).max(10000).parse(data);
   return store.transaction(async tx=>{const rows=await tx.query<{id:string;key_ciphertext:string}>("SELECT id,key_ciphertext FROM redeem_codes WHERE app_id=$1 AND environment=$2 AND id=ANY($3::uuid[])",[scoped().appId,scoped().environment,ids]);await audit(tx,principal,"codes.revealed",scoped().appId,null,{count:rows.length},scoped().environment);return rows.map(row=>({id:row.id,key:decryptValue(row.key_ciphertext)}));});
  }
  case "preferences.save": {
   const input=z.object({theme:z.enum(["light","dark","system"]),timezone:z.string().max(100),dateFormat:z.enum(["locale","iso"])}).strict().parse(data);try{new Intl.DateTimeFormat("en",{timeZone:input.timezone});}catch{throw new LicenseDomainError("invalid_timezone");}return store.transaction(tx=>tx.query("INSERT INTO admin_preferences(member_id,preferences) VALUES($1,$2) ON CONFLICT(member_id) DO UPDATE SET preferences=$2",[principal.id,JSON.stringify(input)]));
  }
  default: throw new LicenseDomainError("unknown_command",404);
 }
}
