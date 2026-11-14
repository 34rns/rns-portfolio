import { auth } from "./index";
import { loadStaffPrincipal } from "./staff";
import { assertCapability } from "./permissions";
import { getLicenseStore } from "../licensing/transaction-store";
import { LicenseDomainError,type Principal,type AppScope } from "../licensing/contracts";
export async function requirePrincipal():Promise<Principal>{
 const session=await auth(),user=session?.user;
 if(!user?.id)throw new LicenseDomainError("unauthorized",401);
 if(user.role==="staff")return loadStaffPrincipal(getLicenseStore(),user.id,user.sessionVersion??-1,user.authenticatedAt??0);
 if(user.role==="admin" && user.id==="admin" && process.env.LICENSE_STAFF_ENABLED!=="true")return {kind:"staff",id:"admin",role:"owner",appIds:[],environments:["sandbox","live"],capabilities:[],authenticatedAt:user.authenticatedAt};
 if(user.role==="customer")throw new LicenseDomainError("forbidden",403);
 throw new LicenseDomainError("unauthorized",401);
}
export async function requireCapability(capability:string,scope?:AppScope){const principal=await requirePrincipal();assertCapability(principal,capability,scope);return principal;}
