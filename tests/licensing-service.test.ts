import { generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLicenseForAdmin,
  extendLicense,
  resetLicenseDevices,
  revealLicenseKey,
  revokeLicense,
} from "@/lib/licensing/admin";
import { generateLicenseKey } from "@/lib/licensing/keys";
import {
  activateLicense,
  licenseExpiresAt,
  licenseStatus,
  verifyLicense,
} from "@/lib/licensing/service";
import type { LicenseStore } from "@/lib/licensing/store";
import { verifyLicenseToken } from "@/lib/licensing/token";
import { createMemoryLicenseStore } from "./helpers/memory-license-store";

const DAY = 24 * 60 * 60 * 1000;
const T0 = new Date("2026-01-01T12:00:00Z");
const at = (offsetDays: number) => new Date(T0.getTime() + offsetDays * DAY);

beforeEach(() => {
  const { privateKey } = generateKeyPairSync("ed25519");
  vi.stubEnv("LICENSE_SECRET", "vitest-license-secret-that-is-long-enough");
  vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY", privateKey.export({ format: "der", type: "pkcs8" }).toString("base64"));
  vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function issue(
  store: LicenseStore,
  overrides: Partial<Parameters<typeof createLicenseForAdmin>[1]> = {},
) {
  const result = await createLicenseForAdmin(store, {
    projectSlugs: ["paid-project"],
    type: "permanent",
    actorEmail: "admin@example.com",
    ...overrides,
  });
  if (!result.ok) throw new Error(result.error);
  return result;
}

describe("activation", () => {
  it("binds a device and returns a verifiable token", async () => {
    const { store, licenses } = createMemoryLicenseStore();
    const { key } = await issue(store);

    const verdict = await activateLicense({
      store,
      key,
      projectSlug: "paid-project",
      deviceId: "device-1",
      deviceName: "MacBook",
      now: T0,
    });

    expect(verdict.valid).toBe(true);
    expect(verdict.plan).toBe("pro");
    expect(verdict.expiresAt).toBeNull();
    expect(verdict.token).toBeTruthy();
    expect(verdict.graceUntil).toBeTruthy();

    const token = verifyLicenseToken(verdict.token as string, T0);
    expect(token.ok).toBe(true);

    const [license] = [...licenses.values()];
    expect(license.activationCount).toBe(1);
    expect(license.firstActivatedAt?.toISOString()).toBe(T0.toISOString());
  });

  it("is idempotent on the same device", async () => {
    const { store, licenses, activations } = createMemoryLicenseStore();
    const { key } = await issue(store);

    await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "device-1", now: T0 });
    const second = await activateLicense({
      store,
      key,
      projectSlug: "paid-project",
      deviceId: "device-1",
      now: at(1),
    });

    expect(second.valid).toBe(true);
    expect(activations.size).toBe(1);
    expect([...licenses.values()][0].activationCount).toBe(1);
  });

  it("enforces the device limit", async () => {
    const { store, activations } = createMemoryLicenseStore();
    const { key } = await issue(store, { maxDevices: 2 });

    const first = await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: T0 });
    const second = await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "b", now: T0 });
    const third = await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "c", now: T0 });

    expect(first.valid).toBe(true);
    expect(second.valid).toBe(true);
    expect(third).toMatchObject({ valid: false, reason: "device_limit" });
    expect(activations.size).toBe(2);
  });

  it("never exceeds the device limit under concurrent requests", async () => {
    const { store, licenses, activations } = createMemoryLicenseStore();
    const { key } = await issue(store, { maxDevices: 2 });

    const results = await Promise.all(
      ["a", "b", "c", "d", "e"].map((deviceId) =>
        activateLicense({ store, key, projectSlug: "paid-project", deviceId, now: T0 }),
      ),
    );

    expect(results.filter((result) => result.valid)).toHaveLength(2);
    expect(activations.size).toBe(2);
    expect([...licenses.values()][0].activationCount).toBe(2);
  });

  it("counts a time-limited key from the first activation, not from later ones", async () => {
    const { store } = createMemoryLicenseStore();
    const { key, license } = await issue(store, {
      type: "timelimited",
      days: 30,
      maxDevices: 3,
    });

    const first = await activateLicense({
      store,
      key,
      projectSlug: "paid-project",
      deviceId: "a",
      now: T0,
    });
    expect(first.expiresAt).toBe(at(30).toISOString());

    const later = await activateLicense({
      store,
      key,
      projectSlug: "paid-project",
      deviceId: "b",
      now: at(10),
    });
    expect(later.expiresAt).toBe(at(30).toISOString());

    const afterExpiry = await activateLicense({
      store,
      key,
      projectSlug: "paid-project",
      deviceId: "c",
      now: at(31),
    });
    expect(afterExpiry).toMatchObject({ valid: false, reason: "expired" });

    const stored = await store.findLicenseById(license.id);
    expect(stored && licenseExpiresAt(stored)?.toISOString()).toBe(at(30).toISOString());
  });

  it("refuses a key whose activation window has closed", async () => {
    const { store } = createMemoryLicenseStore();
    const { key } = await issue(store, {
      type: "timelimited",
      days: 90,
      activateBy: at(-1),
    });

    const verdict = await activateLicense({
      store,
      key,
      projectSlug: "paid-project",
      deviceId: "a",
      now: T0,
    });
    expect(verdict).toMatchObject({ valid: false, reason: "expired" });
  });
});

describe("verification", () => {
  it("requires an activation before a key verifies", async () => {
    const { store } = createMemoryLicenseStore();
    const { key } = await issue(store);

    const before = await verifyLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: T0 });
    expect(before).toMatchObject({ valid: false, reason: "not_activated" });

    await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: T0 });

    const after = await verifyLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: T0 });
    expect(after.valid).toBe(true);
    expect(after.token).toBeTruthy();
  });

  it("refreshes by token and keeps it bound to its device", async () => {
    const { store } = createMemoryLicenseStore();
    const { key } = await issue(store);
    const activated = await activateLicense({
      store,
      key,
      projectSlug: "paid-project",
      deviceId: "a",
      now: T0,
    });

    // Well inside the twelve-hour token, so the refresh itself is what is tested.
    const refreshed = await verifyLicense({
      store,
      token: activated.token,
      projectSlug: "paid-project",
      deviceId: "a",
      now: at(0.2),
    });
    expect(refreshed.valid).toBe(true);

    const replayed = await verifyLicense({
      store,
      token: activated.token,
      projectSlug: "paid-project",
      deviceId: "b",
      now: at(0.2),
    });
    expect(replayed).toMatchObject({ valid: false, reason: "invalid_token" });

    const elsewhere = await verifyLicense({
      store,
      token: activated.token,
      projectSlug: "other-project",
      now: at(0.2),
    });
    expect(elsewhere).toMatchObject({ valid: false, reason: "wrong_project" });
  });

  it("stops verifying an expired token and a revoked key at request time", async () => {
    const { store } = createMemoryLicenseStore();
    const { key, license } = await issue(store);
    const activated = await activateLicense({
      store,
      key,
      projectSlug: "paid-project",
      deviceId: "a",
      now: T0,
    });

    const staleToken = await verifyLicense({
      store,
      token: activated.token,
      projectSlug: "paid-project",
      deviceId: "a",
      now: at(2),
    });
    expect(staleToken).toMatchObject({ valid: false, reason: "token_expired" });

    await revokeLicense(store, { id: license.id, actorEmail: "admin@example.com", reason: "chargeback" });

    const revoked = await verifyLicense({
      store,
      token: activated.token,
      projectSlug: "paid-project",
      deviceId: "a",
      now: at(0.1),
    });
    expect(revoked).toMatchObject({ valid: false, reason: "revoked" });

    const byKey = await verifyLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: at(0.1) });
    expect(byKey).toMatchObject({ valid: false, reason: "revoked" });
  });

  it("treats another project exactly like an unknown key", async () => {
    const { store } = createMemoryLicenseStore();
    const { key } = await issue(store, { projectSlugs: ["paid-project"] });

    const wrongProject = await activateLicense({
      store,
      key,
      projectSlug: "other-project",
      deviceId: "a",
      now: T0,
    });
    const unknownKey = await activateLicense({
      store,
      key: generateLicenseKey(),
      projectSlug: "other-project",
      deviceId: "a",
      now: T0,
    });

    expect(wrongProject).toMatchObject({ valid: false, reason: "invalid_key" });
    expect(wrongProject).toEqual(unknownKey);
  });

  it("refuses draft projects, malformed keys and unknown keys", async () => {
    const { store } = createMemoryLicenseStore();
    const { key } = await issue(store);

    expect(
      await activateLicense({ store, key, projectSlug: "draft-project", deviceId: "a", now: T0 }),
    ).toMatchObject({ valid: false, reason: "invalid_key" });

    expect(
      await activateLicense({ store, key: "nonsense", projectSlug: "paid-project", deviceId: "a", now: T0 }),
    ).toMatchObject({ valid: false, reason: "invalid_key" });

    expect(
      await verifyLicense({ store, projectSlug: "paid-project", now: T0 }),
    ).toMatchObject({ valid: false, reason: "invalid_key" });
  });

  it("lets a bundle unlock any published project", async () => {
    const { store } = createMemoryLicenseStore();
    const { key } = await issue(store, { projectSlugs: [] });

    const verdict = await activateLicense({
      store,
      key,
      projectSlug: "other-project",
      deviceId: "a",
      now: T0,
    });
    expect(verdict.valid).toBe(true);
  });
});

describe("admin actions", () => {
  it("stores only the hash and the ciphertext of the key", async () => {
    const { store, licenses } = createMemoryLicenseStore();
    const { key, license } = await issue(store);

    expect(license.keyLookup).not.toBe(key);
    expect(license.keyLookup).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify([...licenses.values()])).not.toContain(key);

    const revealed = await revealLicenseKey(store, { id: license.id, actorEmail: "admin@example.com" });
    expect(revealed.ok && revealed.key).toBe(key);
  });

  it("validates what it is asked to mint", async () => {
    const { store } = createMemoryLicenseStore();

    expect(
      await createLicenseForAdmin(store, {
        projectSlugs: ["nope"],
        type: "permanent",
        actorEmail: "admin@example.com",
      }),
    ).toMatchObject({ ok: false });

    expect(
      await createLicenseForAdmin(store, {
        projectSlugs: [],
        type: "timelimited",
        days: null,
        actorEmail: "admin@example.com",
      }),
    ).toMatchObject({ ok: false, error: expect.stringContaining("days") });

    expect(
      await createLicenseForAdmin(store, {
        projectSlugs: [],
        type: "permanent",
        maxDevices: 50,
        actorEmail: "admin@example.com",
      }),
    ).toMatchObject({ ok: false, error: expect.stringContaining("devices") });
  });

  it("extends a lapsed key and refuses to extend a permanent one", async () => {
    const { store } = createMemoryLicenseStore();
    const { key, license } = await issue(store, { type: "timelimited", days: 30 });

    await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: T0 });
    expect(
      await verifyLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: at(40) }),
    ).toMatchObject({ valid: false, reason: "expired" });

    await extendLicense(store, { id: license.id, days: 30, actorEmail: "admin@example.com" });
    expect(
      await verifyLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: at(40) }),
    ).toMatchObject({ valid: true });

    const permanent = await issue(store);
    expect(
      await extendLicense(store, { id: permanent.license.id, days: 30, actorEmail: "admin@example.com" }),
    ).toMatchObject({ ok: false, error: expect.stringContaining("Permanent") });
  });

  it("resets devices without restarting the activation clock", async () => {
    const { store, licenses } = createMemoryLicenseStore();
    const { key, license } = await issue(store, { type: "timelimited", days: 30, maxDevices: 1 });

    await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: T0 });
    expect(
      await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "b", now: at(5) }),
    ).toMatchObject({ valid: false, reason: "device_limit" });

    await resetLicenseDevices(store, { id: license.id, actorEmail: "admin@example.com" });

    const fresh = await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "b", now: at(6) });
    expect(fresh.valid).toBe(true);
    expect(fresh.expiresAt).toBe(at(30).toISOString());
    expect([...licenses.values()][0].firstActivatedAt?.toISOString()).toBe(T0.toISOString());
  });

  it("un-revokes a key and records every action", async () => {
    const { store, events } = createMemoryLicenseStore();
    const { key, license } = await issue(store);

    await activateLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: T0 });
    await revokeLicense(store, { id: license.id, actorEmail: "admin@example.com", reason: "fraud" });
    const restored = await revokeLicense(store, {
      id: license.id,
      actorEmail: "admin@example.com",
      revoked: false,
    });

    expect(restored.ok).toBe(true);
    expect(
      await verifyLicense({ store, key, projectSlug: "paid-project", deviceId: "a", now: at(1) }),
    ).toMatchObject({ valid: true });

    expect(events.map((event) => event.action)).toEqual([
      "created",
      "activated",
      "revoked",
      "unrevoked",
    ]);
    expect(events.filter((event) => event.actorEmail === "admin@example.com")).toHaveLength(3);
  });
});

describe("derived status", () => {
  const base = {
    type: "permanent" as const,
    days: null,
    firstActivatedAt: null,
    activateBy: null,
    activationCount: 0,
    revokedAt: null,
  };

  it("never stores status, it derives it", () => {
    expect(licenseStatus(base, T0)).toBe("unused");
    expect(licenseStatus({ ...base, activationCount: 1 }, T0)).toBe("active");
    expect(licenseStatus({ ...base, activationCount: 1, revokedAt: T0 }, T0)).toBe("revoked");
    expect(
      licenseStatus(
        {
          ...base,
          type: "timelimited",
          days: 10,
          activationCount: 1,
          firstActivatedAt: T0,
        },
        at(11),
      ),
    ).toBe("expired");
    expect(licenseStatus({ ...base, activateBy: at(-1) }, T0)).toBe("expired");
  });
});
