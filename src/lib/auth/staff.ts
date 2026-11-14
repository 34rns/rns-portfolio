import { randomBytes } from "node:crypto";
import { z } from "zod";
import type { AppStore } from "../licensing/transaction-store";
import { LicenseDomainError,staffRoleSchema,type Principal,type StaffRole } from "../licensing/contracts";
import { assertCapability } from "./permissions";
import { audit } from "../licensing/apps";
import { advisoryLock } from "../licensing/entitlements";
import { lookupHash } from "../security/secrets";
import { hashPassword,verifyPassword } from "./password";
import { verifySecondFactor } from "./totp";
export type Member={id:string;email:string;name:string;password_hash:string;role:StaffRole;app_ids:string[];capabilities:string[];disabled_at:Date|null;session_version:number;totp_ciphertext:string|null;totp_step:number|null};
export function assertFresh(principal:Principal,now:Date){if(!principal.authenticatedAt||now.getTime()-principal.authenticatedAt>300000||principal.authenticatedAt>now.getTime())throw new LicenseDomainError("reauthentication_required",401);}
const inviteInput=z.object({email:z.email().transform(s=>s.toLowerCase()),role:staffRoleSchema,appIds:z.array(z.uuid()).max(100),name:z.string().max(100).optional()}).strict();
export async function createStaffInvite(store:AppStore,owner:Principal,input:unknown,now:Date):Promise<{token:string;expiresAt:string}>{
 assertCapability(owner,"team.write");assertFresh(owner,now);const parsed=inviteInput.parse(input),token=randomBytes(32).toString("base64url"),expiresAt=new Date(now.getTime()+86400000);
 await store.transaction(async tx=>{await tx.query("INSERT INTO admin_invites(email,role,app_ids,token_hash,expires_at) VALUES($1,$2,$3,$4,$5)",[parsed.email,parsed.role,JSON.stringify(parsed.appIds),lookupHash(`invite:${token}`),expiresAt]);await audit(tx,owner,"staff.invited",null,null,{email:parsed.email,role:parsed.role});});return {token,expiresAt:expiresAt.toISOString()};
}
export async function acceptStaffInvite(store:AppStore,token:string,input:{name:string;password:string},now:Date):Promise<{id:string}>{
 const parsed=z.object({name:z.string().trim().min(1).max(100),password:z.string().min(12).max(256)}).parse(input);
 const passwordHash=await hashPassword(parsed.password);
 return store.transaction(async tx=>{const [invite]=await tx.query<{email:string;role:StaffRole;app_ids:string[]}>("UPDATE admin_invites SET used_at=$2 WHERE token_hash=$1 AND used_at IS NULL AND expires_at>$2 RETURNING *",[lookupHash(`invite:${token}`),now]);if(!invite)throw new LicenseDomainError("invalid_invite",410);const [member]=await tx.query<{id:string}>("INSERT INTO admin_members(email,name,password_hash,role,app_ids) VALUES($1,$2,$3,$4,$5) RETURNING id",[invite.email,parsed.name,passwordHash,invite.role,JSON.stringify(invite.app_ids)]);return member;});
}
export async function authenticateStaff(store:AppStore,email:string,password:string,otp:string,now:Date):Promise<{id:string;email:string;name:string;sessionVersion:number}|null>{
 if(password.length>256||email.length>256||otp.length>100)return null;
 const member=await store.read(async tx=>(await tx.query<Member>("SELECT * FROM admin_members WHERE email=$1 AND disabled_at IS NULL",[email.trim().toLowerCase()]))[0]);
 if(!member||!staffRoleSchema.safeParse(member.role).success||!(await verifyPassword(password,member.password_hash)))return null;
 if(member.totp_ciphertext && !(await verifySecondFactor(store,member.id,otp,now)))return null;
 return {id:member.id,email:member.email,name:member.name,sessionVersion:member.session_version};
}
export async function loadStaffPrincipal(store:AppStore,id:string,version:number,at:number):Promise<Principal>{
 const member=await store.read(async tx=>(await tx.query<Member>("SELECT * FROM admin_members WHERE id=$1 AND disabled_at IS NULL",[id]))[0]);
 if(!member||member.session_version!==version||!staffRoleSchema.safeParse(member.role).success)throw new LicenseDomainError("unauthorized",401);
 return {kind:"staff",id,role:member.role,appIds:member.app_ids,environments:["sandbox","live"],capabilities:member.capabilities,authenticatedAt:at};
}
export async function updateStaff(store:AppStore,owner:Principal,id:string,input:{role?:StaffRole;disabled?:boolean;appIds?:string[];capabilities?:string[];password?:string},now:Date):Promise<void>{
 assertCapability(owner,"team.write");assertFresh(owner,now);
 const parsed=z.object({role:staffRoleSchema.optional(),disabled:z.boolean().optional(),appIds:z.array(z.uuid()).optional(),capabilities:z.array(z.enum(["codes.generate","licenses.write","notes.write"])).optional(),password:z.string().min(12).max(256).optional()}).strict().parse(input);
 const passwordHash=parsed.password?await hashPassword(parsed.password):null;
 await store.transaction(async tx=>{
   await advisoryLock(tx,"admin-owner-membership");const [member]=await tx.query<Member>("SELECT * FROM admin_members WHERE id=$1 FOR UPDATE",[id]);if(!member)throw new LicenseDomainError("not_found",404);
   if(member.role==="owner" && !member.disabled_at && (parsed.disabled||parsed.role && parsed.role!=="owner")){
     const [{count}]=await tx.query<{count:string}>("SELECT count(*) FROM admin_members WHERE role='owner' AND disabled_at IS NULL");if(Number(count)<=1)throw new LicenseDomainError("last_owner",409);
   }
   await tx.query("UPDATE admin_members SET role=$2,disabled_at=$3,app_ids=$4,capabilities=$5,password_hash=$6,session_version=session_version+1 WHERE id=$1",[id,parsed.role??member.role,parsed.disabled===undefined?member.disabled_at:parsed.disabled?now:null,JSON.stringify(parsed.appIds??member.app_ids),JSON.stringify(parsed.capabilities??member.capabilities),passwordHash??member.password_hash]);
   await audit(tx,owner,"staff.updated",null,id,{role:parsed.role,disabled:parsed.disabled,passwordReset:!!passwordHash});
 });
}
