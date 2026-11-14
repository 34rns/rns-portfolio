import { generateCodesSchema, LicenseDomainError, type AppScope, type Principal, type GrantInput } from "./contracts";
import type { AppStore } from "./transaction-store";
import { assertCapability } from "../auth/permissions";
import { readApp, audit } from "./apps";
import { generateRedeemCode, codeLookup } from "./code-crypto";
import { encryptValue } from "../security/secrets";
import { randomUUID } from "node:crypto";
export async function issueCodes(store:AppStore,principal:Principal,scope:AppScope,input:unknown):Promise<{id:string;key:string}[]>{
  assertCapability(principal,"codes.generate",scope);const parsed=generateCodesSchema.parse(input);
  if(parsed.count>100)throw new LicenseDomainError("use_batch_generator");
  return store.transaction(async tx=>{
    const app=await readApp(tx,scope.appId,true);if(app.archived_at)throw new LicenseDomainError("app_archived",410);
    const plan=app.config.plans.find(p=>p.key===parsed.planKey);if(!plan || parsed.featureKeys.some(k=>!app.config.features.some(f=>f.key===k)))throw new LicenseDomainError("invalid_plan_features");
    if(parsed.campaignId && !(await tx.query("SELECT id FROM redeem_campaigns WHERE id=$1 AND app_id=$2 AND environment=$3",[parsed.campaignId,scope.appId,scope.environment])).length)throw new LicenseDomainError("invalid_campaign");
    const grant:GrantInput={type:parsed.type,planKey:parsed.planKey,featureKeys:[...new Set([...plan.featureKeys,...parsed.featureKeys])],stackable:parsed.stackable,...(parsed.durationSeconds?{durationSeconds:parsed.durationSeconds}:{}),...(parsed.calendarMonths?{calendarMonths:parsed.calendarMonths}:{}),...(parsed.accessUntil?{accessUntil:parsed.accessUntil}:{})};
    const codes=Array.from({length:parsed.count},()=>({id:randomUUID(),key:generateRedeemCode(parsed.prefix)}));
    await tx.query('INSERT INTO redeem_codes(id,app_id,environment,key_lookup,key_ciphertext,masked,"grant",max_redemptions,max_devices,redeem_by,campaign_id,note) SELECT unnest($1::uuid[]),$2,$3,unnest($4::text[]),unnest($5::text[]),unnest($6::text[]),$7::jsonb,$8,$9,$10,$11,$12',[codes.map(c=>c.id),scope.appId,scope.environment,codes.map(c=>codeLookup(scope,c.key)),codes.map(c=>encryptValue(c.key)),codes.map(c=>`${parsed.prefix}-••••-••••-••••-${c.key.slice(-4)}`),JSON.stringify(grant),parsed.maxRedemptions,parsed.maxDevices??app.config.maxDevices,parsed.redeemBy??null,parsed.campaignId,parsed.note]);
    await audit(tx,principal,"codes.generated",scope.appId,null,{count:codes.length},scope.environment);return codes;
  });
}
export { redeemCode, activateExistingLicense, applyLicenseAction, deactivateDevice, inspectAccess } from "./lifecycle";
