import { readApp, type LicenseApp } from "./apps";
import { LicenseDomainError, type AccessSnapshot, type AppScope } from "./contracts";
import { normalizeLicenseKey, licenseKeyLookup } from "./keys";
import { licenseCoversProject, licenseExpiresAt, licenseStatus } from "./service";
import type { AppStore, SqlExecutor } from "./transaction-store";

type LegacyRow = { id: string; project_slugs: string[]; type: "permanent" | "timelimited"; days: number | null; first_activated_at: Date | null; activate_by: Date | null; activation_count: number; max_devices: number; revoked_at: Date | null };
async function checked(tx: SqlExecutor, scope: AppScope, field: "id" | "key_lookup", value: string, lock = false) {
  const app = await readApp(tx, scope.appId);
  if (scope.environment !== "live" || !app.config.linkedProjectId) throw new LicenseDomainError("invalid_code", 401);
  if (app.archived_at) throw new LicenseDomainError("app_archived", 410);
  if (app.config.bindingMode !== "device") throw new LicenseDomainError("identity_required", 401);
  const [project] = await tx.query<{slug:string;status:string}>("SELECT slug,status FROM projects WHERE id=$1", [app.config.linkedProjectId]);
  const [license] = await tx.query<LegacyRow>(`SELECT * FROM licenses WHERE ${field}=$1${lock ? " FOR UPDATE" : ""}`, [value]);
  if (!project || project.status !== "published" || !license || !licenseCoversProject({projectSlugs:license.project_slugs}, project.slug)) throw new LicenseDomainError("invalid_code", 401);
  return {app,license};
}
function accessOf(scope: AppScope, app: LicenseApp, license: LegacyRow, deviceId: string, now: Date): AccessSnapshot {
  const record = {type:license.type,days:license.days,firstActivatedAt:license.first_activated_at,activateBy:license.activate_by,activationCount:license.activation_count,revokedAt:license.revoked_at};
  const status = licenseStatus(record, now), expiresAt = licenseExpiresAt(record)?.toISOString() ?? null;
  if (status === "revoked" || status === "expired") throw new LicenseDomainError(status, 403);
  const plan = app.config.plans.find(p => p.key === "pro");
  if (!plan) throw new LicenseDomainError("legacy_pro_plan_required");
  return {licenseId:license.id,source:"legacy",appId:scope.appId,environment:scope.environment,status:"active",planKey:"pro",features:plan.featureKeys.map(key => ({key,expiresAt})),expiresAt,revision:1,deviceId};
}
// Share original records and slots: importing them as new grants would detach revocation and restart expiry.
export async function activateLegacy(store: AppStore, scope: AppScope, key: string, deviceId: string, now: Date) {
  const normalized = normalizeLicenseKey(key);
  if (!normalized) throw new LicenseDomainError("invalid_code", 401);
  return store.transaction(async tx => {
    const {app,license} = await checked(tx, scope, "key_lookup", licenseKeyLookup(normalized), true);
    accessOf(scope, app, license, deviceId, now);
    const existing = await tx.query("SELECT id FROM license_activations WHERE license_id=$1 AND device_id=$2", [license.id,deviceId]);
    if (!existing.length) {
      const claimed = await tx.query<LegacyRow>("UPDATE licenses SET activation_count=activation_count+1,first_activated_at=COALESCE(first_activated_at,$2),updated_at=$2 WHERE id=$1 AND activation_count<max_devices RETURNING *", [license.id,now]);
      if (!claimed.length) throw new LicenseDomainError("device_limit", 409);
      Object.assign(license,claimed[0]);
      await tx.query("INSERT INTO license_activations(license_id,device_id,first_seen,last_seen) VALUES($1,$2,$3,$3)", [license.id,deviceId,now]);
      await tx.query("INSERT INTO license_events(license_id,action,actor_email,detail) VALUES($1,'activated','system','Activated through app integration')", [license.id]);
    } else await tx.query("UPDATE license_activations SET last_seen=$3 WHERE license_id=$1 AND device_id=$2", [license.id,deviceId,now]);
    return {access:accessOf(scope,app,license,deviceId,now),activationKey:normalized};
  });
}
export async function inspectLegacy(store: AppStore, scope: AppScope, licenseId: string, deviceId: string, now: Date) {
  return store.read(async tx => {
    const {app,license} = await checked(tx,scope,"id",licenseId);
    if (!(await tx.query("SELECT id FROM license_activations WHERE license_id=$1 AND device_id=$2", [licenseId,deviceId])).length) throw new LicenseDomainError("unauthorized",401);
    return accessOf(scope,app,license,deviceId,now);
  });
}
export async function deactivateLegacy(store: AppStore, scope: AppScope, licenseId: string, deviceId: string) {
  await store.transaction(async tx => {
    await checked(tx,scope,"id",licenseId,true);
    const removed = await tx.query("DELETE FROM license_activations WHERE license_id=$1 AND device_id=$2 RETURNING id", [licenseId,deviceId]);
    if (removed.length) await tx.query("UPDATE licenses SET activation_count=GREATEST(0,activation_count-1),updated_at=now() WHERE id=$1", [licenseId]);
  });
}
