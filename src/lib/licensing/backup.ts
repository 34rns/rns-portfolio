import { z } from "zod";
import { assertCapability } from "../auth/permissions";
import { assertFresh } from "../auth/staff";
import { LicenseDomainError, type Principal } from "./contracts";
import type { AppStore } from "./transaction-store";
// Parent tables precede dependents. Production secrets are backed up separately by the owner.
export const backupTables=["users","site_settings","projects","models","purchases","orders","licenses","license_activations","license_events","processed_webhook_events","purchase_audit_log","license_apps","license_plans","license_features","license_plan_features","redeem_campaigns","redeem_presets","redeem_batches","redeem_codes","access_licenses","access_grants","code_redemptions","access_devices","license_identities","admin_members","admin_invites","admin_recovery_codes","app_api_keys","admin_audit_events","admin_saved_views","admin_preferences","license_webhooks","license_outbox","license_deliveries","license_job_runs","license_integration_checks","license_return_tickets","license_requests","admin_totp_enrollments","license_command_requests"] as const;
const backupSchema=z.object({version:z.literal("keygate.backup.v1"),createdAt:z.iso.datetime(),tables:z.record(z.string(),z.array(z.record(z.string(),z.unknown())).max(10000))}).strict();
export async function captureBackup(store:AppStore,principal:Principal,now:Date){
 assertCapability(principal,"backup.export");assertFresh(principal,now);
 return store.transaction(async tx=>{await tx.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");const tables:Record<string,Record<string,unknown>[]>={};let bytes=0;
  for(const table of backupTables){tables[table]=await tx.query(`SELECT * FROM "${table}" LIMIT 10001`);if(tables[table].length>10000)throw new LicenseDomainError("backup_limit_exceeded");bytes+=Buffer.byteLength(JSON.stringify(tables[table]));if(bytes>25*1024*1024)throw new LicenseDomainError("backup_limit_exceeded");}
  return {version:"keygate.backup.v1" as const,createdAt:now.toISOString(),tables};
 });
}
export async function restoreBackup(store:AppStore,value:unknown,mode:"validate"|"apply"){
 const backup=backupSchema.parse(value);if(Object.keys(backup.tables).length!==backupTables.length||backupTables.some(t=>!backup.tables[t]))throw new LicenseDomainError("invalid_backup_tables");
 if(Buffer.byteLength(JSON.stringify(backup))>25*1024*1024)throw new LicenseDomainError("backup_limit_exceeded");
 return store.transaction(async tx=>{
  let rows=0;
  for(const table of backupTables){
   const columns=await tx.query<{column_name:string;udt_name:string}>("SELECT column_name,udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",[table]);if(!columns.length)throw new LicenseDomainError("backup_schema_mismatch");
   const [{count}]=await tx.query<{count:string}>(`SELECT count(*) FROM "${table}"`);if(mode==="apply"&&Number(count))throw new LicenseDomainError("restore_target_not_empty");
   for(const row of backup.tables[table]){if(Object.keys(row).some(k=>!columns.some(c=>c.column_name===k))||Object.keys(row).length!==columns.length)throw new LicenseDomainError("backup_schema_mismatch");rows++;}
  }
  // Validate mode also exercises constraints and types; its inserts are rolled back to a savepoint.
  await tx.query("SAVEPOINT backup_validation");
  if(mode==="validate"){for(const table of backupTables){const [{count}]=await tx.query<{count:string}>(`SELECT count(*) FROM "${table}"`);if(Number(count))throw new LicenseDomainError("restore_target_not_empty");}}
  for(const table of backupTables){
   for(let offset=0;offset<backup.tables[table].length;offset+=100)await tx.query(`INSERT INTO "${table}" SELECT * FROM jsonb_populate_recordset(NULL::"${table}",$1::jsonb)`,[JSON.stringify(backup.tables[table].slice(offset,offset+100))]);
  }
  if(mode==="validate")await tx.query("ROLLBACK TO SAVEPOINT backup_validation");return {applied:mode==="apply",rows,tables:backupTables.length};
 });
}
