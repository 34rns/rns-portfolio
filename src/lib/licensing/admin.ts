import { decryptValue } from "@/lib/security/secrets";
import { encryptLicenseKey, generateLicenseKey, licenseKeyLookup, normalizeLicenseKey } from "./keys";
import { licenseStatus } from "./service";
import {
  DEFAULT_MAX_DEVICES,
  type LicenseRecord,
  type LicenseStore,
  type LicenseType,
} from "./store";

const MAX_DEVICES_CAP = 20;
const MAX_DAYS = 3650;

export type CreateLicenseResult =
  | { ok: true; license: LicenseRecord; key: string }
  | { ok: false; error: string };

function cleanNote(note: string | null | undefined): string | null {
  const trimmed = note?.trim();
  return trimmed ? trimmed.slice(0, 500) : null;
}

function validDays(days: number | null | undefined): number | null {
  if (days == null) return null;
  if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) return null;
  return days;
}

/**
 * Mints the key first and stores only its HMAC and ciphertext. An empty
 * `projectSlugs` list means every project, which is how a bundle is expressed.
 */
export async function createLicenseForAdmin(
  store: LicenseStore,
  {
    projectSlugs,
    type,
    days,
    activateBy,
    maxDevices,
    note,
    orderId,
    actorEmail,
    key = generateLicenseKey(),
  }: {
    projectSlugs: string[];
    type: LicenseType;
    days?: number | null;
    activateBy?: Date | null;
    maxDevices?: number | null;
    note?: string | null;
    orderId?: string | null;
    actorEmail: string;
    /** Injected by tests; production always generates one. */
    key?: string;
  },
): Promise<CreateLicenseResult> {
  const normalizedKey = normalizeLicenseKey(key);
  if (!normalizedKey) return { ok: false, error: "That key is not in the expected format." };

  const requestedDevices = maxDevices ?? DEFAULT_MAX_DEVICES;
  if (!Number.isInteger(requestedDevices) || requestedDevices < 1 || requestedDevices > MAX_DEVICES_CAP) {
    return { ok: false, error: `Choose between 1 and ${MAX_DEVICES_CAP} devices.` };
  }

  if (type === "timelimited") {
    if (validDays(days) === null) {
      return { ok: false, error: "A time-limited key needs between 1 and 3650 days." };
    }
  }

  const known = await store.listProjectSlugs();
  const slugs = [...new Set(projectSlugs.map((slug) => slug.trim()).filter(Boolean))];
  const unknown = slugs.filter((slug) => !known.includes(slug));
  if (unknown.length > 0) {
    return { ok: false, error: `Unknown project: ${unknown.join(", ")}` };
  }

  const license = await store.createLicense({
    keyLookup: licenseKeyLookup(normalizedKey),
    keyCiphertext: encryptLicenseKey(normalizedKey),
    projectSlugs: slugs,
    type,
    days: type === "timelimited" ? (days as number) : null,
    activateBy: type === "timelimited" ? (activateBy ?? null) : null,
    maxDevices: requestedDevices,
    note: cleanNote(note),
    orderId: orderId ?? null,
  });

  await store.recordEvent({
    licenseId: license.id,
    action: "created",
    actorEmail,
    detail: `${type === "timelimited" ? `${days} days` : "Permanent"} · ${
      slugs.length === 0 ? "all projects" : slugs.join(", ")
    } · ${requestedDevices} device(s)`,
  });

  return { ok: true, license, key: normalizedKey };
}

export type LicenseActionResult =
  | { ok: true; license: LicenseRecord; key?: string }
  | { ok: false; error: string };

export async function revokeLicense(
  store: LicenseStore,
  {
    id,
    actorEmail,
    reason,
    revoked = true,
  }: { id: string; actorEmail: string; reason?: string | null; revoked?: boolean },
): Promise<LicenseActionResult> {
  const license = await store.findLicenseById(id);
  if (!license) return { ok: false, error: "That key no longer exists." };

  if (revoked && license.revokedAt) return { ok: true, license };
  if (!revoked && !license.revokedAt) return { ok: true, license };

  const revokedAt = revoked ? new Date() : null;
  const revokedReason = revoked ? cleanNote(reason) : null;

  await store.updateLicense(license.id, { revokedAt, revokedReason });
  await store.recordEvent({
    licenseId: license.id,
    action: revoked ? "revoked" : "unrevoked",
    actorEmail,
    detail: revokedReason,
  });

  return { ok: true, license: { ...license, revokedAt, revokedReason } };
}

/**
 * Extending moves the end date, which is derived from the first activation, so
 * a key that lapsed yesterday becomes valid again with the same number of
 * devices and the same history.
 */
export async function extendLicense(
  store: LicenseStore,
  { id, days, actorEmail }: { id: string; days: number; actorEmail: string },
): Promise<LicenseActionResult> {
  const license = await store.findLicenseById(id);
  if (!license) return { ok: false, error: "That key no longer exists." };

  if (license.type === "permanent") {
    return { ok: false, error: "Permanent keys never expire, so there is nothing to extend." };
  }

  if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
    return { ok: false, error: "Enter between 1 and 3650 extra days." };
  }

  const next = (license.days ?? 0) + days;
  await store.updateLicense(license.id, { days: next });
  await store.recordEvent({
    licenseId: license.id,
    action: "extended",
    actorEmail,
    detail: `+${days} days (now ${next})`,
  });

  return { ok: true, license: { ...license, days: next } };
}

/** Frees every device slot. The activation clock keeps running. */
export async function resetLicenseDevices(
  store: LicenseStore,
  { id, actorEmail }: { id: string; actorEmail: string },
): Promise<LicenseActionResult> {
  const license = await store.findLicenseById(id);
  if (!license) return { ok: false, error: "That key no longer exists." };

  await store.resetActivations(license.id);
  await store.recordEvent({
    licenseId: license.id,
    action: "devices_reset",
    actorEmail,
    detail: `${license.activationCount} device(s) released`,
  });

  return { ok: true, license: { ...license, activationCount: 0 } };
}

/** Decrypts the stored key for the operator and leaves a trail of having done so. */
export async function revealLicenseKey(
  store: LicenseStore,
  { id, actorEmail }: { id: string; actorEmail: string },
): Promise<LicenseActionResult> {
  const license = await store.findLicenseById(id);
  if (!license) return { ok: false, error: "That key no longer exists." };

  let key: string;
  try {
    key = decryptValue(license.keyCiphertext);
  } catch {
    return {
      ok: false,
      error: "That key cannot be decrypted with the current LICENSE_SECRET.",
    };
  }

  await store.recordEvent({
    licenseId: license.id,
    action: "key_shown",
    actorEmail,
    detail: null,
  });

  return { ok: true, license, key };
}

export function describeLicense(license: LicenseRecord, now = new Date()) {
  return {
    status: licenseStatus(license, now),
    devices: `${license.activationCount}/${license.maxDevices}`,
  };
}
