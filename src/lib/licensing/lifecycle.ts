import { LicenseDomainError, type AccessSnapshot, type AppScope, type Binding, type Principal } from "./contracts";
import type { AppStore } from "./transaction-store";
import type { AccessRecord, CodeRecord, GrantRecord } from "./access-records";
import { assertCapability } from "../auth/permissions";
import { readApp } from "./apps";
import { codeLookup, normalizeRedeemCode, deviceHash, activationKey } from "./code-crypto";
import { encryptValue, decryptValue, lookupHash } from "../security/secrets";
import { activationLookup, advisoryLock, loadLicense, snapshot, joinDevice, recordEvent, grantExpiry } from "./entitlements";

export async function redeemCode(store: AppStore, scope: AppScope, input: { code: string; binding: Binding; activationKey?: string }, idempotency: string, now: Date): Promise<{ access: AccessSnapshot; activationKey?: string }> {
  const code = normalizeRedeemCode(input.code); if (!code) throw new LicenseDomainError("invalid_code", 401);
  if (!idempotency || idempotency.length > 128) throw new LicenseDomainError("idempotency_required");
  if (input.binding.deviceId.length < 8 || input.binding.deviceId.length > 256) throw new LicenseDomainError("invalid_device");
  const requestKey = lookupHash(`request:${scope.appId}:${scope.environment}:${idempotency}`);
  const requestHash = lookupHash(JSON.stringify([code, input.binding.deviceId, input.binding.trustedSubject ?? null, input.activationKey ?? null]));
  return store.transaction(async tx => {
    await advisoryLock(tx, requestKey);
    const app = await readApp(tx, scope.appId); if (app.archived_at) throw new LicenseDomainError("app_archived", 410);
    if (app.config.bindingMode === "account" && !input.binding.trustedSubject) throw new LicenseDomainError("identity_required", 401);
    const bindingHash = lookupHash(`${app.config.bindingMode}:${app.config.bindingMode === "account" ? input.binding.trustedSubject : input.binding.deviceId}`);
    await advisoryLock(tx, `${scope.appId}:${scope.environment}:${bindingHash}`);
    const [request] = await tx.query<{ request_hash: string; license_id: string }>("SELECT * FROM license_requests WHERE app_id=$1 AND environment=$2 AND hash=$3", [scope.appId, scope.environment, requestKey]);
    if (request && request.request_hash !== requestHash) throw new LicenseDomainError("idempotency_conflict", 409);
    const [record] = await tx.query<CodeRecord>("SELECT * FROM redeem_codes WHERE key_lookup=$1 AND app_id=$2 AND environment=$3 FOR UPDATE", [codeLookup(scope, code), scope.appId, scope.environment]);
    if (!record || record.revoked_at) throw new LicenseDomainError("invalid_code", 401);
    let license: AccessRecord | undefined;
    if (input.activationKey) {
      [license] = await tx.query<AccessRecord>("SELECT * FROM access_licenses WHERE activation_lookup=$1 AND app_id=$2 AND environment=$3 FOR UPDATE", [activationLookup(scope, input.activationKey), scope.appId, scope.environment]);
      if (!license || (app.config.bindingMode === "account" && license.subject !== input.binding.trustedSubject)) throw new LicenseDomainError("unauthorized", 401);
    } else [license] = await tx.query<AccessRecord>("SELECT * FROM access_licenses WHERE binding_hash=$1 AND app_id=$2 AND environment=$3 FOR UPDATE", [bindingHash, scope.appId, scope.environment]);
    const redemptionBinding = license?.binding_hash ?? bindingHash;
    const [previous] = await tx.query<{ license_id: string; activation_lookup: string | null }>("SELECT license_id,activation_lookup FROM code_redemptions WHERE code_id=$1 AND binding_hash=$2", [record.id, redemptionBinding]);
    if (request || previous) {
      license = await loadLicense(tx, scope, request?.license_id ?? previous.license_id, true);
      if (app.config.bindingMode === "device" && !input.activationKey && previous?.activation_lookup !== license.activation_lookup) throw new LicenseDomainError("unauthorized",401);
      if (license.binding_hash !== bindingHash && !input.activationKey) throw new LicenseDomainError("unauthorized", 401);
      if (!(await tx.query("SELECT id FROM access_devices WHERE license_id=$1 AND device_hash=$2 AND deactivated_at IS NULL", [license.id, deviceHash(input.binding.deviceId)])).length) throw new LicenseDomainError("unauthorized", 401);
      if (!request) await tx.query("INSERT INTO license_requests(app_id,environment,hash,request_hash,license_id) VALUES($1,$2,$3,$4,$5)", [scope.appId, scope.environment, requestKey, requestHash, license.id]);
      return { access: await snapshot(tx, scope, license, input.binding.deviceId, now, app), ...(app.config.bindingMode === "device" ? { activationKey: decryptValue(license.activation_ciphertext) } : {}) };
    }
    if (record.redeem_by && record.redeem_by <= now) throw new LicenseDomainError("redeem_deadline", 410);
    if (record.redemption_count >= record.max_redemptions) throw new LicenseDomainError("code_exhausted", 409);
    if (record.grant.accessUntil && new Date(record.grant.accessUntil) <= now) throw new LicenseDomainError("expired", 410);
    if (license) {
      if (license.revoked_at) throw new LicenseDomainError("revoked", 403);
      if (app.config.bindingMode === "device" && !input.activationKey) throw new LicenseDomainError("activation_required", 401);
      if (!record.grant.stackable && (await snapshot(tx, scope, license, input.binding.deviceId, now, app)).status === "active") throw new LicenseDomainError("not_stackable", 409);
    }
    if (record.grant.type === "trial" && (await tx.query("SELECT g.id FROM access_grants g JOIN access_licenses l ON l.id=g.license_id WHERE l.app_id=$1 AND l.environment=$2 AND l.binding_hash=$3 AND g.input->>'type'='trial'", [scope.appId, scope.environment, redemptionBinding])).length) throw new LicenseDomainError("trial_used", 409);
    if (record.grant.type === "bundle" && (!license || !["active","paused"].includes((await snapshot(tx,scope,license,input.binding.deviceId,now,app)).status))) throw new LicenseDomainError("base_license_required",409);
    if (!license) {
      const key = activationKey();
      [license] = await tx.query<AccessRecord>("INSERT INTO access_licenses(app_id,environment,binding_hash,subject,activation_lookup,activation_ciphertext,max_devices,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [scope.appId, scope.environment, bindingHash, input.binding.trustedSubject ?? null, activationLookup(scope, key), encryptValue(key), record.max_devices, now]);
    }
    await joinDevice(tx, scope, license, input.binding.deviceId, now);
    const grants = await tx.query<GrantRecord>("SELECT * FROM access_grants WHERE license_id=$1 AND undone_at IS NULL", [license.id]);
    const same = grants.filter(g => g.input.planKey === record.grant.planKey && (g.input.type === "bundle") === (record.grant.type === "bundle") && (record.grant.type !== "bundle" || g.input.featureKeys.length === record.grant.featureKeys.length && g.input.featureKeys.every(key => record.grant.featureKeys.includes(key))));
    const starts = record.grant.stackable && !record.grant.accessUntil ? new Date(Math.max(now.getTime(), ...same.map(g => g.expires_at?.getTime() ?? 0))) : now;
    let expires = grantExpiry(record.grant, starts); let remaining: number | null = null;
    if (license.paused_at && expires) {
      const extra = grantExpiry(record.grant, now)!.getTime() - now.getTime();
      remaining = Math.ceil(extra / 1000) + (record.grant.stackable ? Math.max(0, ...same.map(g => g.remaining_seconds ?? 0)) : 0);
      expires = new Date(now.getTime() + remaining * 1000);
    }
    const priority = app.config.plans.find(p => p.key === record.grant.planKey)?.priority ?? 0;
    await tx.query("INSERT INTO access_grants(license_id,code_id,input,plan_priority,starts_at,expires_at,remaining_seconds) VALUES($1,$2,$3,$4,$5,$6,$7)", [license.id, record.id, JSON.stringify(record.grant), priority, now, expires, remaining]);
    await tx.query("INSERT INTO code_redemptions(app_id,environment,code_id,license_id,binding_hash,idempotency_hash,request_hash,created_at,activation_lookup) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)", [scope.appId, scope.environment, record.id, license.id, license.binding_hash, requestKey, requestHash, now, license.activation_lookup]);
    await tx.query("INSERT INTO license_requests(app_id,environment,hash,request_hash,license_id) VALUES($1,$2,$3,$4,$5)", [scope.appId, scope.environment, requestKey, requestHash, license.id]);
    await tx.query("UPDATE redeem_codes SET redemption_count=redemption_count+1 WHERE id=$1", [record.id]);
    [license] = await tx.query<AccessRecord>("UPDATE access_licenses SET revision=revision+1,updated_at=$2 WHERE id=$1 RETURNING *", [license.id, now]);
    await recordEvent(tx, scope, license.id, "redeemed", { codeId: record.id });
    return { access: await snapshot(tx, scope, license, input.binding.deviceId, now, app), ...(app.config.bindingMode === "device" ? { activationKey: decryptValue(license.activation_ciphertext) } : {}) };
  });
}
export async function activateExistingLicense(store: AppStore, scope: AppScope, binding: Binding, key: string | undefined, now: Date): Promise<AccessSnapshot> {
  return store.transaction(async tx => {
    const app = await readApp(tx, scope.appId); if (app.archived_at) throw new LicenseDomainError("app_archived", 410);
    if (app.config.bindingMode === "account" && !binding.trustedSubject) throw new LicenseDomainError("identity_required",401);
    if (app.config.bindingMode === "device" && !key) throw new LicenseDomainError("activation_required",401);
    const [license] = app.config.bindingMode === "account"
      ? await tx.query<AccessRecord>("SELECT * FROM access_licenses WHERE subject=$1 AND app_id=$2 AND environment=$3 FOR UPDATE",[binding.trustedSubject,scope.appId,scope.environment])
      : await tx.query<AccessRecord>("SELECT * FROM access_licenses WHERE activation_lookup=$1 AND app_id=$2 AND environment=$3 FOR UPDATE", [activationLookup(scope, key!), scope.appId, scope.environment]);
    if (!license) throw new LicenseDomainError("unauthorized", 401);
    if (app.config.bindingMode === "account" && (!binding.trustedSubject || license.subject !== binding.trustedSubject)) throw new LicenseDomainError("identity_required", 401);
    const access = await snapshot(tx, scope, license, binding.deviceId, now, app);
    if (access.status !== "active") throw new LicenseDomainError(access.status, 403);
    await joinDevice(tx, scope, license, binding.deviceId, now); return access;
  });
}
export async function inspectAccess(store: AppStore, scope: AppScope, licenseId: string, deviceId: string, now: Date, tokenRevision?: number): Promise<AccessSnapshot> {
  return store.read(async tx => {
    const app = await readApp(tx, scope.appId); if (app.archived_at) throw new LicenseDomainError("app_archived", 410);
    const license = await loadLicense(tx, scope, licenseId);
    if (tokenRevision !== undefined && tokenRevision < (license.min_token_revision ?? 1)) throw new LicenseDomainError("unauthorized",401);
    if (!(await tx.query("SELECT id FROM access_devices WHERE license_id=$1 AND device_hash=$2 AND deactivated_at IS NULL", [licenseId, deviceHash(deviceId)])).length) throw new LicenseDomainError("unauthorized", 401);
    return snapshot(tx, scope, license, deviceId, now, app);
  });
}
export async function deactivateDevice(store: AppStore, scope: AppScope, licenseId: string, deviceId: string, now: Date): Promise<void> {
  await store.transaction(async tx => {
    await loadLicense(tx, scope, licenseId, true);
    const changed = await tx.query("UPDATE access_devices SET deactivated_at=$3 WHERE license_id=$1 AND device_hash=$2 AND deactivated_at IS NULL RETURNING id", [licenseId, deviceHash(deviceId), now]);
    if (changed.length) { await tx.query("UPDATE access_licenses SET revision=revision+1 WHERE id=$1", [licenseId]); await recordEvent(tx, scope, licenseId, "device-removed"); }
  });
}
export type LicenseAction = { licenseId: string; action: string; reason: string; redemptionId?: string; seconds?: number; targetSubject?: string };
export async function applyLicenseAction(store: AppStore, principal: Principal, scope: AppScope, input: LicenseAction, now: Date): Promise<AccessSnapshot> {
  assertCapability(principal, input.action === "transfer" ? "licenses.transfer" : "licenses.write", scope);
  if (!input.reason.trim() || input.reason.length > 1000) throw new LicenseDomainError("reason_required");
  return store.transaction(async tx => {
    let license = await loadLicense(tx, scope, input.licenseId, true);
    const grants = await tx.query<GrantRecord>("SELECT * FROM access_grants WHERE license_id=$1 AND undone_at IS NULL", [license.id]);
    switch (input.action) {
      case "pause":
        if (!license.paused_at) {
          for (const grant of grants) if (grant.expires_at) await tx.query("UPDATE access_grants SET remaining_seconds=$2 WHERE id=$1", [grant.id, Math.max(0, Math.ceil((grant.expires_at.getTime() - now.getTime()) / 1000))]);
          await tx.query("UPDATE access_licenses SET paused_at=$2 WHERE id=$1", [license.id, now]);
        } break;
      case "resume":
        if (license.paused_at) {
          for (const grant of grants) if (grant.expires_at) await tx.query("UPDATE access_grants SET starts_at=$2,expires_at=$3,remaining_seconds=NULL WHERE id=$1", [grant.id, now, new Date(now.getTime() + (grant.remaining_seconds ?? 0) * 1000)]);
          await tx.query("UPDATE access_licenses SET paused_at=NULL WHERE id=$1", [license.id]);
        } break;
      case "revoke": await tx.query("UPDATE access_licenses SET revoked_at=COALESCE(revoked_at,$2) WHERE id=$1", [license.id, now]); break;
      case "restore": await tx.query("UPDATE access_licenses SET revoked_at=NULL WHERE id=$1", [license.id]); break;
      case "extend": {
        if (!Number.isInteger(input.seconds) || input.seconds! < 60 || input.seconds! > 315360000) throw new LicenseDomainError("invalid_duration");
        const base = grants.filter(g => g.input.type !== "bundle").sort((a, b) => b.plan_priority - a.plan_priority || (b.expires_at?.getTime() ?? Infinity) - (a.expires_at?.getTime() ?? Infinity))[0];
        if (!base) throw new LicenseDomainError("no_base_grant");
        if (base.expires_at) await tx.query("UPDATE access_grants SET expires_at=$2,remaining_seconds=$3 WHERE id=$1", [base.id, new Date(Math.max(now.getTime(), base.expires_at.getTime()) + input.seconds! * 1000), license.paused_at ? (base.remaining_seconds ?? 0) + input.seconds! : null]);
        break;
      }
      case "undo": {
        const [redemption] = await tx.query<{ code_id: string }>("UPDATE code_redemptions SET undone_at=$3 WHERE id=$1 AND license_id=$2 RETURNING code_id", [input.redemptionId, license.id, now]);
        if (!redemption) throw new LicenseDomainError("not_found", 404);
        await tx.query("UPDATE access_grants SET undone_at=$3 WHERE code_id=$1 AND license_id=$2", [redemption.code_id, license.id, now]); break;
      }
      case "transfer": {
        const app = await readApp(tx, scope.appId);
        if (app.config.bindingMode !== "account" || !input.targetSubject || !(await tx.query("SELECT id FROM license_identities WHERE app_id=$1 AND environment=$2 AND subject=$3", [scope.appId, scope.environment, input.targetSubject])).length) throw new LicenseDomainError("verified_target_required");
        const key = activationKey();
        await tx.query("UPDATE access_licenses SET subject=$2,binding_hash=$3,activation_lookup=$4,activation_ciphertext=$5,min_token_revision=revision+1 WHERE id=$1", [license.id, input.targetSubject, lookupHash(`account:${input.targetSubject}`), activationLookup(scope, key), encryptValue(key)]);
        await tx.query("UPDATE access_devices SET deactivated_at=$2 WHERE license_id=$1 AND deactivated_at IS NULL", [license.id, now]); break;
      }
      default: throw new LicenseDomainError("invalid_action");
    }
    [license] = await tx.query<AccessRecord>("UPDATE access_licenses SET revision=revision+1,updated_at=$2 WHERE id=$1 RETURNING *", [license.id, now]);
    const eventNames:Record<string,string>={pause:"paused",resume:"resumed",revoke:"revoked",restore:"restored",extend:"extended",undo:"redemption-undone",transfer:"transferred"};
    await recordEvent(tx, scope, license.id, eventNames[input.action], { reason: input.reason }, principal);
    return snapshot(tx, scope, license, "admin-inspection", now);
  });
}
