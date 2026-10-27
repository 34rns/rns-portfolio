import { afterEach, describe, expect, it, vi } from "vitest";
import {
  KEY_LENGTH,
  encryptLicenseKey,
  formatLicenseKey,
  generateLicenseKey,
  licenseKeyLookup,
  normalizeLicenseKey,
} from "@/lib/licensing/keys";
import { decryptValue, lookupHash, secretsConfigured } from "@/lib/security/secrets";

const SECRET = "vitest-license-secret-that-is-long-enough";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("license keys", () => {
  it("looks like XXXXX-XXXXX-XXXXX-XXXXX", () => {
    const key = generateLicenseKey();
    expect(key).toMatch(/^[A-Z0-9]{5}(-[A-Z0-9]{5}){3}$/);
    expect(key.replace(/-/g, "")).toHaveLength(KEY_LENGTH);
    expect(key).toBe(formatLicenseKey(key.replace(/-/g, "")));
  });

  it("avoids the characters people misread", () => {
    const generated = Array.from({ length: 200 }, () => generateLicenseKey().replace(/-/g, ""));
    for (const key of generated) {
      expect(key).not.toMatch(/[IO01]/);
    }
  });

  it("does not repeat itself", () => {
    const keys = new Set(Array.from({ length: 500 }, () => generateLicenseKey()));
    expect(keys.size).toBe(500);
  });

  it("normalises what a buyer pastes", () => {
    const key = generateLicenseKey();
    expect(normalizeLicenseKey(key.toLowerCase())).toBe(key);
    expect(normalizeLicenseKey(` ${key} `)).toBe(key);
    expect(normalizeLicenseKey(key.replace(/-/g, " "))).toBe(key);
    expect(normalizeLicenseKey(key)).toBe(key);
  });

  it("refuses anything that is not a key", () => {
    expect(normalizeLicenseKey("")).toBeNull();
    expect(normalizeLicenseKey(null)).toBeNull();
    expect(normalizeLicenseKey(undefined)).toBeNull();
    expect(normalizeLicenseKey("ABCDE-FGHJK-LMNPQ-RSTU")).toBeNull(); // 19 characters
    expect(normalizeLicenseKey("ABCDE-FGHJK-LMNPQ-RSTUVW")).toBeNull(); // 21 characters
    expect(normalizeLicenseKey("IIIII-IIIII-IIIII-IIIII")).toBeNull();
    expect(normalizeLicenseKey("00000-00000-00000-00000")).toBeNull();
  });
});

describe("hashed lookup and encryption at rest", () => {
  it("hashes the key instead of storing it", () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);
    const key = generateLicenseKey();
    const hash = licenseKeyLookup(key);

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(key.replace(/-/g, ""));
    expect(licenseKeyLookup(key)).toBe(hash);
    expect(licenseKeyLookup(generateLicenseKey())).not.toBe(hash);
  });

  it("keys the hash to LICENSE_SECRET, so a rotation invalidates a stolen index", () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);
    const first = lookupHash("SOMETHING");
    vi.stubEnv("LICENSE_SECRET", `${SECRET}-rotated`);
    expect(lookupHash("SOMETHING")).not.toBe(first);
  });

  it("round-trips a key through AES-256-GCM", () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);
    const key = generateLicenseKey();
    const ciphertext = encryptLicenseKey(key);

    expect(ciphertext).not.toContain(key);
    expect(decryptValue(ciphertext)).toBe(key);
  });

  it("refuses a value that was encrypted under another secret", () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);
    const ciphertext = encryptLicenseKey(generateLicenseKey());

    vi.stubEnv("LICENSE_SECRET", `${SECRET}-other`);
    expect(() => decryptValue(ciphertext)).toThrow();
  });

  it("refuses a tampered payload instead of returning nonsense", () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);
    const ciphertext = encryptLicenseKey("ABCDE-FGHJK-LMNPQ-RSTUV");
    const raw = Buffer.from(ciphertext, "base64");
    raw[raw.length - 1] ^= 0xff;

    expect(() => decryptValue(raw.toString("base64"))).toThrow();
  });

  it("reports missing secrets rather than guessing one", () => {
    vi.stubEnv("LICENSE_SECRET", "");
    expect(secretsConfigured()).toBe(false);
    expect(() => licenseKeyLookup("ABCDE-FGHJK-LMNPQ-RSTUV")).toThrow(/LICENSE_SECRET/);

    vi.stubEnv("LICENSE_SECRET", "short");
    expect(secretsConfigured()).toBe(false);
    expect(() => licenseKeyLookup("ABCDE-FGHJK-LMNPQ-RSTUV")).toThrow(/32 bytes/);

    vi.stubEnv("LICENSE_SECRET", SECRET);
    expect(secretsConfigured()).toBe(true);
  });
});
