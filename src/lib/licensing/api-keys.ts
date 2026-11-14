import { randomBytes } from "node:crypto";
import { z } from "zod";
import { LicenseDomainError, type AppScope, type Principal } from "./contracts";
import type { AppStore } from "./transaction-store";
import { assertCapability } from "../auth/permissions";
import { audit } from "./apps";
import { lookupHash } from "../security/secrets";
export const apiCapabilities=["identity.write","apps.read","codes.read","codes.generate","codes.write","licenses.read","licenses.write","notes.write","integrations.read"] as const;
const keyInput=z.object({name:z.string().trim().min(1).max(80),capabilities:z.array(z.enum(apiCapabilities)).min(1),expiresAt:z.iso.datetime().optional()}).strict();
export async function createAppKey(store:AppStore,principal:Principal,scope:AppScope,input:unknown):Promise<{id:string;secret:string}>{
  assertCapability(principal,"security.write",scope);const parsed=keyInput.parse(input),secret=`kg_${scope.environment}_${randomBytes(32).toString("base64url")}`;
  return store.transaction(async tx=>{const [key]=await tx.query<{id:string}>("INSERT INTO app_api_keys(app_id,environment,name,lookup,prefix,capabilities,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id",[scope.appId,scope.environment,parsed.name,lookupHash(`api:${secret}`),secret.slice(0,16),JSON.stringify(parsed.capabilities),parsed.expiresAt??null]);await audit(tx,principal,"api-key.created",scope.appId,key.id,{},scope.environment);return {id:key.id,secret};});
}
export async function authenticateAppKey(store:AppStore,scope:AppScope,secret:string,capability:string|null,now:Date):Promise<Principal>{
  if(secret.length>128)throw new LicenseDomainError("unauthorized",401);
  return store.transaction(async tx=>{const [key]=await tx.query<{id:string;capabilities:string[]}>("UPDATE app_api_keys SET last_used_at=$4 WHERE lookup=$1 AND app_id=$2 AND environment=$3 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>$4) RETURNING id,capabilities",[lookupHash(`api:${secret}`),scope.appId,scope.environment,now]);if(!key||capability!==null&&!key.capabilities.includes(capability))throw new LicenseDomainError("unauthorized",401);return {kind:"api",id:key.id,appIds:[scope.appId],environments:[scope.environment],capabilities:key.capabilities};});
}
export async function revokeAppKey(store:AppStore,principal:Principal,scope:AppScope,id:string){assertCapability(principal,"security.write",scope);await store.transaction(async tx=>{await tx.query("UPDATE app_api_keys SET revoked_at=now() WHERE id=$1 AND app_id=$2 AND environment=$3",[id,scope.appId,scope.environment]);await audit(tx,principal,"api-key.revoked",scope.appId,id,{},scope.environment);});}
