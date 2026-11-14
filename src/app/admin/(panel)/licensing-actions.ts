"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/auth/principal";
import { getLicenseStore } from "@/lib/licensing/transaction-store";
import { runAdminCommand } from "@/lib/licensing/admin-commands";
import { LicenseDomainError } from "@/lib/licensing/contracts";
export type CommandState={error?:string;result?:unknown;success?:boolean};
export async function licenseCommand(_state:CommandState,form:FormData):Promise<CommandState>{
 try{const principal=await requirePrincipal(),scope=form.get("scope")?JSON.parse(String(form.get("scope"))):null,data=JSON.parse(String(form.get("data")??"null"));const result=await runAdminCommand(getLicenseStore(),principal,String(form.get("command")),scope,data);revalidatePath("/admin","layout");return {success:true,result:JSON.parse(JSON.stringify(result??null))};}
 catch(error){return {error:error instanceof LicenseDomainError?error.code.replaceAll("_"," "):error instanceof z.ZodError?error.issues.map(i=>`${i.path.join(".")||"Form"}: ${i.message}`).join("; "):"Could not save. Verify database setup or try again."};}
}
