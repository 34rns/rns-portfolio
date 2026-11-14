import { LicenseDomainError, type AppScope, type Principal } from "../licensing/contracts";
const ownerOnly=["apps.create","team.write","security.write","backup.export","backup.restore","portfolio.write","secrets.reveal"];
export function can(principal:Principal,capability:string,scope?:AppScope):boolean{
  if(principal.kind==="staff" && principal.role==="owner") return true;
  if(scope && (!principal.appIds.includes(scope.appId)||!principal.environments.includes(scope.environment))) return false;
  if(ownerOnly.includes(capability)) return false;
  if(principal.kind==="api") return principal.capabilities.includes(capability);
  if(!principal.role) return false;
  if(principal.capabilities.includes(capability)) return true;
  if(capability.endsWith(".read") || capability==="help.read") return true;
  if(principal.role==="admin") return ["apps.write","codes.generate","codes.write","codes.export","licenses.write","licenses.transfer","integrations.write","notes.write"].includes(capability);
  return principal.role==="helper" && (capability==="notes.write" || (capability==="codes.generate" && scope?.environment==="sandbox"));
}
export function assertCapability(principal:Principal,capability:string,scope?:AppScope):void{if(!can(principal,capability,scope)) throw new LicenseDomainError("forbidden",403);}
