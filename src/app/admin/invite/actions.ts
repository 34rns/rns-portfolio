"use server";
import { headers } from "next/headers";
import { acceptStaffInvite } from "@/lib/auth/staff";
import { getLicenseStore } from "@/lib/licensing/transaction-store";
import { checkSharedLimit } from "@/lib/licensing/shared-limits";
import { trustedClientAddress } from "@/lib/licensing/http";
import { lookupHash } from "@/lib/security/secrets";
export async function acceptInvite(_state:{error?:string;success?:boolean},form:FormData){try{const store=getLicenseStore();await checkSharedLimit(store,`invite:${lookupHash(trustedClientAddress(await headers()))}`,5,60,new Date());await acceptStaffInvite(store,String(form.get("token")),{name:String(form.get("name")),password:String(form.get("password"))},new Date());return {success:true};}catch{return {error:"Invitation could not be accepted. Check its expiry and password (at least 12 characters), or ask the owner for a new link."};}}
