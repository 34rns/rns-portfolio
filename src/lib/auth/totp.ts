import { createHmac,randomBytes } from "node:crypto";
import type { AppStore,SqlExecutor } from "../licensing/transaction-store";
import { LicenseDomainError,type Principal } from "../licensing/contracts";
import { encryptValue,decryptValue,lookupHash,safeEqual } from "../security/secrets";
import { assertFresh,type Member } from "./staff";
const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32(bytes:Buffer){let bits=0,value=0,out="";for(const byte of bytes){value=(value<<8)|byte;bits+=8;while(bits>=5){out+=alphabet[(value>>>(bits-5))&31];bits-=5;}}if(bits)out+=alphabet[(value<<(5-bits))&31];return out;}
function decode(secret:string){let bits=0,value=0;const bytes:number[]=[];for(const char of secret){const n=alphabet.indexOf(char);if(n<0)throw new Error("Invalid authenticator secret");value=(value<<5)|n;bits+=5;if(bits>=8){bytes.push((value>>>(bits-8))&255);bits-=8;}}return Buffer.from(bytes);}
export function totpCode(secret:string,now:Date):string{const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(now.getTime()/30000)));const digest=createHmac("sha1",decode(secret)).update(counter).digest(),offset=digest[19]&15;return ((digest.readUInt32BE(offset)&0x7fffffff)%1000000).toString().padStart(6,"0");}
function validStep(secret:string,code:string,now:Date,last:number|null){if(!/^\d{6}$/.test(code))return null;const current=Math.floor(now.getTime()/30000);for(const step of [current,current-1,current+1])if(step>(last??-1)&&safeEqual(totpCode(secret,new Date(step*30000)),code))return step;return null;}
export async function beginTotp(store:AppStore,principal:Principal,now:Date):Promise<{secret:string;recoveryCodes:string[]}>{
 assertFresh(principal,now);const secret=base32(randomBytes(20)),recoveryCodes=Array.from({length:8},()=>randomBytes(10).toString("hex"));
 await store.transaction(async tx=>{const [member]=await tx.query<Member>("SELECT * FROM admin_members WHERE id=$1 FOR UPDATE",[principal.id]);if(!member||member.totp_ciphertext)throw new LicenseDomainError("already_enrolled",409);await tx.query("INSERT INTO admin_totp_enrollments(member_id,secret_ciphertext,recovery_hashes,expires_at) VALUES($1,$2,$3,$4) ON CONFLICT(member_id) DO UPDATE SET secret_ciphertext=$2,recovery_hashes=$3,expires_at=$4",[principal.id,encryptValue(secret),JSON.stringify(recoveryCodes.map(c=>lookupHash(`recovery:${c}`))),new Date(now.getTime()+600000)]);});return {secret,recoveryCodes};
}
export async function confirmTotp(store:AppStore,principal:Principal,code:string,now:Date):Promise<void>{
 assertFresh(principal,now);await store.transaction(async tx=>{const [setup]=await tx.query<{secret_ciphertext:string;recovery_hashes:string[]}>("SELECT * FROM admin_totp_enrollments WHERE member_id=$1 AND expires_at>$2 FOR UPDATE",[principal.id,now]);const step=setup?validStep(decryptValue(setup.secret_ciphertext),code,now,null):null;if(!setup||step===null)throw new LicenseDomainError("invalid_second_factor",401);await tx.query("UPDATE admin_members SET totp_ciphertext=$2,totp_step=$3,session_version=session_version+1 WHERE id=$1 AND totp_ciphertext IS NULL",[principal.id,setup.secret_ciphertext,step]);await tx.query("DELETE FROM admin_recovery_codes WHERE member_id=$1",[principal.id]);for(const hash of setup.recovery_hashes)await tx.query("INSERT INTO admin_recovery_codes(member_id,code_hash) VALUES($1,$2)",[principal.id,hash]);await tx.query("DELETE FROM admin_totp_enrollments WHERE member_id=$1",[principal.id]);});
}
async function verifyInTransaction(tx:SqlExecutor,id:string,code:string,now:Date):Promise<boolean>{
 const [member]=await tx.query<Member>("SELECT * FROM admin_members WHERE id=$1 AND disabled_at IS NULL FOR UPDATE",[id]);if(!member?.totp_ciphertext)return false;
 const step=validStep(decryptValue(member.totp_ciphertext),code,now,member.totp_step);
 if(step!==null){await tx.query("UPDATE admin_members SET totp_step=$2 WHERE id=$1",[id,step]);return true;}
 const rows=await tx.query("UPDATE admin_recovery_codes SET used_at=$3 WHERE member_id=$1 AND code_hash=$2 AND used_at IS NULL RETURNING id",[id,lookupHash(`recovery:${code}`),now]);return rows.length===1;
}
export async function verifySecondFactor(store:AppStore,id:string,code:string,now:Date):Promise<boolean>{return store.transaction(tx=>verifyInTransaction(tx,id,code,now));}
