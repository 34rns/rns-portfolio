import type { AppStore } from "./transaction-store";
import { createHash,randomBytes } from "node:crypto";
import { z } from "zod";
import { LicenseDomainError,type AppScope,type AccessResponse } from "./contracts";
import { verifyAccessToken,signAccessToken,issuer } from "./v1-token";
import { siteUrl } from "../seo";
import { readApp } from "./apps";
import { loadLicense,snapshot } from "./entitlements";
import { lookupHash,safeEqual,decryptValue } from "../security/secrets";
import { deviceHash } from "./code-crypto";
const ticketInput=z.object({token:z.string().max(16000),deviceId:z.string().min(8).max(256),origin:z.url().max(500),pkceChallenge:z.string().regex(/^[A-Za-z0-9_-]{43}$/)}).strict();
export async function issueReturnTicket(store:AppStore,scope:AppScope,value:unknown,now:Date):Promise<{ticket:string;expiresAt:string}>{
 const input=ticketInput.parse(value),proof=verifyAccessToken(input.token,scope,input.deviceId,now,true),ticket=randomBytes(32).toString("base64url"),expires=new Date(now.getTime()+300000);
 await store.transaction(async tx=>{const app=await readApp(tx,scope.appId);if(app.archived_at)throw new LicenseDomainError("app_archived",410);if(new URL(input.origin).origin!==input.origin||![...app.config.allowedOrigins,new URL(issuer()).origin,new URL(siteUrl()).origin].includes(input.origin))throw new LicenseDomainError("origin_denied",403);const license=await loadLicense(tx,scope,proof.licenseId,true);if(proof.revision<(license.min_token_revision??1))throw new LicenseDomainError("unauthorized",401);if(!(await tx.query("SELECT id FROM access_devices WHERE license_id=$1 AND device_hash=$2 AND deactivated_at IS NULL",[license.id,deviceHash(input.deviceId)])).length)throw new LicenseDomainError("unauthorized",401);const access=await snapshot(tx,scope,license,input.deviceId,now,app);if(access.status!=="active")throw new LicenseDomainError(access.status,403);await tx.query("INSERT INTO license_return_tickets(hash,app_id,environment,license_id,device_hash,origin,challenge,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",[lookupHash(`ticket:${ticket}`),scope.appId,scope.environment,license.id,deviceHash(input.deviceId),input.origin,input.pkceChallenge,expires]);});
 return {ticket,expiresAt:expires.toISOString()};
}
export async function exchangeReturnTicket(store:AppStore,scope:AppScope,value:unknown,now:Date):Promise<AccessResponse>{
 const input=z.object({ticket:z.string().regex(/^[A-Za-z0-9_-]{43}$/),deviceId:z.string().min(8).max(256),origin:z.url().max(500),pkceVerifier:z.string().regex(/^[A-Za-z0-9._~-]{43,128}$/)}).strict().parse(value);
 return store.transaction(async tx=>{const [ticket]=await tx.query<{license_id:string;challenge:string}>("UPDATE license_return_tickets SET used_at=$6 WHERE hash=$1 AND app_id=$2 AND environment=$3 AND device_hash=$4 AND origin=$5 AND used_at IS NULL AND expires_at>$6 RETURNING license_id,challenge",[lookupHash(`ticket:${input.ticket}`),scope.appId,scope.environment,deviceHash(input.deviceId),input.origin,now]);if(!ticket||!safeEqual(ticket.challenge,createHash("sha256").update(input.pkceVerifier).digest("base64url")))throw new LicenseDomainError("invalid_ticket",401);const app=await readApp(tx,scope.appId);if(app.archived_at)throw new LicenseDomainError("app_archived",410);const license=await loadLicense(tx,scope,ticket.license_id,true);if(!(await tx.query("SELECT id FROM access_devices WHERE license_id=$1 AND device_hash=$2 AND deactivated_at IS NULL",[license.id,deviceHash(input.deviceId)])).length)throw new LicenseDomainError("unauthorized",401);const access=await snapshot(tx,scope,license,input.deviceId,now,app);if(access.status!=="active")throw new LicenseDomainError(access.status,403);return {...signAccessToken(access,now,app.config),...(app.config.bindingMode==="device"?{activationKey:decryptValue(license.activation_ciphertext)}:{})};});
}
