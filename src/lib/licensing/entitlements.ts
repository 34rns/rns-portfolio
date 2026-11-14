import { LicenseDomainError, type AccessSnapshot, type AppScope, type Principal, type GrantInput,type AppInput } from "./contracts";
import type { SqlExecutor } from "./transaction-store";
import type { AccessRecord, GrantRecord } from "./access-records";
import { readApp, audit, type LicenseApp } from "./apps";
import { deviceHash } from "./code-crypto";
import { lookupHash } from "../security/secrets";
export const activationLookup = (scope: AppScope, key: string) => lookupHash(`activation:${scope.appId}:${scope.environment}:${key}`);
export async function advisoryLock(tx: SqlExecutor, value: string) { await tx.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [value]); }
export async function loadLicense(tx: SqlExecutor, scope: AppScope, id: string, locked = false): Promise<AccessRecord> {
  const [license] = await tx.query<AccessRecord>(`SELECT * FROM access_licenses WHERE id=$1 AND app_id=$2 AND environment=$3${locked ? " FOR UPDATE" : ""}`, [id, scope.appId, scope.environment]);
  if (!license) throw new LicenseDomainError("invalid_token", 401); return license;
}
const publicActor: Principal = { kind: "api", id: "license-holder", appIds: [], environments: [], capabilities: [] };
export async function recordEvent(tx: SqlExecutor, scope: AppScope, licenseId: string, type: string, detail: Record<string, unknown> = {}, principal = publicActor) {
  await audit(tx, principal, type, scope.appId, licenseId, detail, scope.environment);
  await tx.query("INSERT INTO license_outbox(app_id,environment,type,license_id,payload) VALUES($1,$2,$3,$4,$5)", [scope.appId, scope.environment, type, licenseId, JSON.stringify({ licenseId, ...detail })]);
}
export function addCalendarMonths(now: Date, months: number): Date {
  const result = new Date(now); const day = result.getUTCDate(); result.setUTCDate(1); result.setUTCMonth(result.getUTCMonth() + months);
  const last = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate(); result.setUTCDate(Math.min(day, last)); return result;
}
export function grantExpiry(input: GrantInput, starts: Date): Date | null {
  if (input.type === "lifetime") return null;
  if (input.accessUntil) return new Date(input.accessUntil);
  if (input.calendarMonths) return addCalendarMonths(starts, input.calendarMonths);
  return new Date(starts.getTime() + input.durationSeconds! * 1000);
}
export async function snapshot(tx: SqlExecutor, scope: AppScope, license: AccessRecord, deviceId: string, now: Date, app?: LicenseApp): Promise<AccessSnapshot> {
  const config = (app ?? await readApp(tx, scope.appId)).config;
  const grants = await tx.query<GrantRecord>("SELECT * FROM access_grants WHERE license_id=$1 AND undone_at IS NULL ORDER BY plan_priority DESC,created_at,id", [license.id]);
  return reduceGrants(scope,license,grants,config,deviceId,now);
}
export function reduceGrants(scope:AppScope,license:AccessRecord,grants:GrantRecord[],config:AppInput,deviceId:string,now:Date):AccessSnapshot{
  const active = grants.filter(g => license.paused_at ? g.expires_at === null || (g.remaining_seconds ?? 0) > 0 : g.starts_at <= now && (g.expires_at === null || g.expires_at.getTime() + config.expiryGraceHours * 3600000 > now.getTime()));
  const bases = active.filter(g => g.input.type !== "bundle");
  const status = license.revoked_at ? "revoked" : license.paused_at ? "paused" : bases.length ? "active" : "expired";
  const expiredBases=grants.filter(g=>g.input.type!=="bundle"&&g.expires_at);
  const expiresAt = bases.some(g => g.expires_at === null) ? null : bases.length ? new Date(Math.max(...bases.map(g => g.expires_at!.getTime()))).toISOString() : expiredBases.length?new Date(Math.max(...expiredBases.map(g=>g.expires_at!.getTime()))).toISOString():null;
  const features = new Map<string, string | null>();
  if (status === "active") for (const grant of active) for (const key of grant.input.featureKeys) {
    if (grant.expires_at && grant.expires_at <= now) continue;
    const expiry = grant.expires_at?.toISOString() ?? null;
    if (!features.has(key) || expiry === null || (features.get(key) !== null && expiry > features.get(key)!)) features.set(key, expiry);
  }
  return { licenseId: license.id, source: "app", appId: scope.appId, environment: scope.environment, status, planKey: bases[0]?.input.planKey??"free", features: [...features].map(([key, expiresAt]) => ({ key, expiresAt })), expiresAt, revision: license.revision, deviceId };
}
export async function joinDevice(tx: SqlExecutor, scope: AppScope, license: AccessRecord, deviceId: string, now: Date) {
  if (deviceId.length < 8 || deviceId.length > 256) throw new LicenseDomainError("invalid_device");
  const hash = deviceHash(deviceId);
  const [device] = await tx.query<{ deactivated_at: Date | null }>("SELECT deactivated_at FROM access_devices WHERE license_id=$1 AND device_hash=$2", [license.id, hash]);
  if (!device || device.deactivated_at) {
    const [{ count }] = await tx.query<{ count: string }>("SELECT count(*) FROM access_devices WHERE license_id=$1 AND deactivated_at IS NULL", [license.id]);
    if (Number(count) >= license.max_devices) throw new LicenseDomainError("device_limit", 409);
    await tx.query("INSERT INTO access_devices(license_id,device_hash,last_seen) VALUES($1,$2,$3) ON CONFLICT(license_id,device_hash) DO UPDATE SET deactivated_at=NULL,last_seen=$3", [license.id, hash, now]);
    await recordEvent(tx, scope, license.id, "device-added");
  } else await tx.query("UPDATE access_devices SET last_seen=$3 WHERE license_id=$1 AND device_hash=$2", [license.id, hash, now]);
}
