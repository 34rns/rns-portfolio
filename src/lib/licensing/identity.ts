import { z } from "zod";
import type { AppStore } from "./transaction-store";
import { LicenseDomainError,type AppScope,type Principal,type Binding } from "./contracts";
import { assertCapability } from "../auth/permissions";
export async function resolveBinding(store:AppStore,scope:AppScope,deviceId:string,subject:string|undefined,proof?:Principal):Promise<Binding>{
 if(!subject)return {deviceId};
 if(!proof||proof.kind!=="api")throw new LicenseDomainError("identity_required",401);
 assertCapability(proof,"identity.write",scope);z.string().min(1).max(256).parse(subject);
 await store.transaction(async tx=>{await tx.query("INSERT INTO license_identities(app_id,environment,subject) VALUES($1,$2,$3) ON CONFLICT(app_id,environment,subject) DO NOTHING",[scope.appId,scope.environment,subject]);});
 return {deviceId,trustedSubject:subject};
}
