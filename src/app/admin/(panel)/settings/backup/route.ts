import { requirePrincipal } from "@/lib/auth/principal";
import { getLicenseStore } from "@/lib/licensing/transaction-store";
import { captureBackup } from "@/lib/licensing/backup";
import { LicenseDomainError } from "@/lib/licensing/contracts";
export async function GET(){const headers={"cache-control":"no-store","x-content-type-options":"nosniff"};try{const backup=await captureBackup(getLicenseStore(),await requirePrincipal(),new Date());return new Response(JSON.stringify(backup),{headers:{...headers,"content-type":"application/json","content-disposition":'attachment; filename="keygate-private-backup.json"'}});}catch(error){return Response.json({code:error instanceof LicenseDomainError?error.code:"backup_failed"},{status:error instanceof LicenseDomainError?error.status:503,headers});}}
