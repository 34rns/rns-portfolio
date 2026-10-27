import { normalizeLicenseKey, licenseKeyLookup } from "./keys";
import {
  deviceFingerprint,
  graceEndsAt,
  signLicenseToken,
  tokenTtlSeconds,
  verifyLicenseToken,
} from "./token";
import type {
  LicenseRecord,
  LicenseStatus,
  LicenseStore,
} from "./store";

export const PLAN = "pro" as const;

export type DenyReason =
  | "invalid_key"
  | "invalid_token"
  | "token_expired"
  | "revoked"
  | "expired"
  | "device_limit"
  | "not_activated"
  | "wrong_project";

export type LicenseVerdict = {
  valid: boolean;
  plan: typeof PLAN | null;
  /** End of the license as an ISO string; null for a permanent key. */
  expiresAt: string | null;
  reason?: DenyReason;
  /** Fresh token, present when the request was accepted. */
  token?: string;
  tokenExpiresAt?: string;
  /** When a cached token stops being honoured, offline included. */
  graceUntil?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** A key that has never been activated, or that never expires, has no end date. */
export function licenseExpiresAt(
  license: Pick<LicenseRecord, "type" | "days" | "firstActivatedAt">,
): Date | null {
  if (license.type !== "timelimited" || !license.days || !license.firstActivatedAt) return null;
  return new Date(license.firstActivatedAt.getTime() + license.days * DAY_MS);
}

/** Evaluated per request; there is no cron and no stored status to go stale. */
export function licenseStatus(
  license: Pick<
    LicenseRecord,
    "type" | "days" | "firstActivatedAt" | "activateBy" | "activationCount" | "revokedAt"
  >,
  now = new Date(),
): LicenseStatus {
  if (license.revokedAt) return "revoked";

  const expiresAt = licenseExpiresAt(license);
  if (expiresAt && expiresAt <= now) return "expired";
  if (!license.firstActivatedAt && license.activateBy && license.activateBy <= now) {
    return "expired";
  }

  return license.activationCount > 0 ? "active" : "unused";
}

/**
 * An empty list means every project — that is the bundle. A key scoped to
 * another project is reported exactly like an unknown key, so the API never
 * confirms that a key exists for something else.
 */
export function licenseCoversProject(
  license: Pick<LicenseRecord, "projectSlugs">,
  projectSlug: string,
): boolean {
  return license.projectSlugs.length === 0 || license.projectSlugs.includes(projectSlug);
}

function denied(reason: DenyReason): LicenseVerdict {
  return { valid: false, plan: null, expiresAt: null, reason };
}

function accepted({
  license,
  projectSlug,
  deviceId,
  now,
}: {
  license: LicenseRecord;
  projectSlug: string;
  deviceId: string;
  now: Date;
}): LicenseVerdict {
  const expiresAt = licenseExpiresAt(license);
  const token = signLicenseToken({
    licenseId: license.id,
    projectSlug,
    deviceId,
    licenseExpiresAt: expiresAt,
    now,
  });

  const tokenExpiresAt = new Date(now.getTime() + tokenTtlSeconds() * 1000);

  return {
    valid: true,
    plan: PLAN,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    token,
    tokenExpiresAt: tokenExpiresAt.toISOString(),
    graceUntil: graceEndsAt(tokenExpiresAt).toISOString(),
  };
}

/** Shared by both endpoints: is this key usable for this project right now? */
async function evaluate({
  store,
  license,
  projectSlug,
  now,
}: {
  store: LicenseStore;
  license: LicenseRecord;
  projectSlug: string;
  now: Date;
}): Promise<DenyReason | null> {
  const project = await store.findProjectBySlug(projectSlug);
  if (!project || project.status !== "published" || !licenseCoversProject(license, projectSlug)) {
    return "invalid_key";
  }

  const status = licenseStatus(license, now);
  if (status === "revoked") return "revoked";
  if (status === "expired") return "expired";

  return null;
}

export async function activateLicense({
  store,
  key,
  projectSlug,
  deviceId,
  deviceName = null,
  now = new Date(),
}: {
  store: LicenseStore;
  key: string;
  projectSlug: string;
  deviceId: string;
  deviceName?: string | null;
  now?: Date;
}): Promise<LicenseVerdict> {
  const normalized = normalizeLicenseKey(key);
  if (!normalized) return denied("invalid_key");

  let license = await store.findLicenseByLookup(licenseKeyLookup(normalized));
  if (!license) return denied("invalid_key");

  const problem = await evaluate({ store, license, projectSlug, now });
  if (problem) return denied(problem);

  const existing = await store.findActivation(license.id, deviceId);

  if (existing) {
    await store.touchActivation(existing.id, deviceName);
  } else {
    // Take the slot before writing the row: a crash in between over-counts,
    // which refuses an activation the buyer is entitled to, where the reverse
    // would hand out a device the limit never allowed.
    const claimed = await store.claimDeviceSlot(license.id, license.maxDevices);
    if (!claimed) return denied("device_limit");

    const { created } = await store.createActivation({
      licenseId: license.id,
      deviceId,
      deviceName,
    });
    // Lost a race with an identical request: the slot we took is not ours.
    if (!created) await store.releaseDeviceSlot(license.id);
  }

  if (!license.firstActivatedAt) {
    license = { ...license, firstActivatedAt: now };
    await store.updateLicense(license.id, { firstActivatedAt: now });
  }

  if (existing) {
    await store.recordEvent({
      licenseId: license.id,
      action: "activated",
      actorEmail: "system",
      detail: deviceName ? `Re-activated on ${deviceName}` : "Re-activated",
    });
  } else {
    await store.recordEvent({
      licenseId: license.id,
      action: "activated",
      actorEmail: "system",
      detail: deviceName ? `Activated on ${deviceName}` : "Activated",
    });
  }
  return accepted({ license, projectSlug, deviceId, now });
}

export async function verifyLicense({
  store,
  key,
  token,
  projectSlug,
  deviceId = null,
  now = new Date(),
}: {
  store: LicenseStore;
  key?: string | null;
  token?: string | null;
  projectSlug: string;
  deviceId?: string | null;
  now?: Date;
}): Promise<LicenseVerdict> {
  let license: LicenseRecord | null = null;
  let boundDevice: string | null = deviceId;

  if (token) {
    const result = verifyLicenseToken(token, now);
    if (!result.ok) {
      return denied(result.reason === "expired" ? "token_expired" : "invalid_token");
    }
    license = await store.findLicenseById(result.payload.sub);
    if (!license) return denied("invalid_token");
    if (result.payload.projectSlug !== projectSlug) return denied("wrong_project");
    // A token is bound to the device it was minted for. A different device must
    // activate, not verify, so a leaked token cannot be replayed elsewhere.
    if (deviceId && result.payload.dev !== deviceFingerprint(deviceId)) {
      return denied("invalid_token");
    }
    if (!deviceId) boundDevice = null;
  } else if (key) {
    const normalized = normalizeLicenseKey(key);
    if (!normalized) return denied("invalid_key");
    license = await store.findLicenseByLookup(licenseKeyLookup(normalized));
    if (!license) return denied("invalid_key");
  } else {
    return denied("invalid_key");
  }

  const problem = await evaluate({ store, license, projectSlug, now });
  if (problem) return denied(problem);

  if (key && deviceId) {
    const activation = await store.findActivation(license.id, deviceId);
    if (!activation) return denied("not_activated");
    await store.touchActivation(activation.id, null);
  }

  // Token refresh needs a device to bind the new token to; without one the
  // caller keeps the token it already holds.
  if (!boundDevice) {
    const expiresAt = licenseExpiresAt(license);
    return { valid: true, plan: PLAN, expiresAt: expiresAt ? expiresAt.toISOString() : null };
  }

  return accepted({ license, projectSlug, deviceId: boundDevice, now });
}
