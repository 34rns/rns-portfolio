import { generateKeyPairSync, verify } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deviceFingerprint,
  graceDays,
  graceEndsAt,
  publicKeys,
  signLicenseToken,
  tokenTtlSeconds,
  verifyLicenseToken,
} from "@/lib/licensing/token";

function makeKey(): string {
  const { privateKey } = generateKeyPairSync("ed25519");
  return privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");
}

let installation: { current: string; previous: string };

beforeEach(() => {
  installation = { current: makeKey(), previous: "" };
  vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY", installation.current);
  vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function token(overrides: Partial<Parameters<typeof signLicenseToken>[0]> = {}) {
  return signLicenseToken({
    licenseId: "license_1",
    projectSlug: "paid-project",
    deviceId: "device-aaa",
    licenseExpiresAt: null,
    ...overrides,
  });
}

describe("license tokens", () => {
  it("signs a payload that verifies", () => {
    const signed = token({ licenseExpiresAt: new Date("2030-01-01T00:00:00Z") });
    const result = verifyLicenseToken(signed);

    expect(signed.split(".")).toHaveLength(3);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.payload.sub).toBe("license_1");
    expect(result.payload.projectSlug).toBe("paid-project");
    expect(result.payload.plan).toBe("pro");
    expect(result.payload.dev).toBe(deviceFingerprint("device-aaa"));
    expect(result.payload.le).toBe(Math.floor(new Date("2030-01-01T00:00:00Z").getTime() / 1000));
  });

  it("keeps the raw device id out of the token", () => {
    const signed = token();
    expect(signed).not.toContain("device-aaa");
    expect(deviceFingerprint("device-aaa")).toBe(deviceFingerprint("device-aaa"));
    expect(deviceFingerprint("device-aaa")).not.toBe(deviceFingerprint("device-bbb"));
  });

  it("rejects a token whose payload was edited", () => {
    const signed = token();
    const [header, , signature] = signed.split(".");
    const forged = Buffer.from(
      JSON.stringify({
        v: 1,
        kid: JSON.parse(Buffer.from(header, "base64url").toString("utf8")).kid,
        sub: "license_1",
        projectSlug: "paid-project",
        dev: deviceFingerprint("device-aaa"),
        plan: "pro",
        iat: 0,
        exp: Math.floor(Date.now() / 1000) + 86_400,
        le: null,
      }),
    ).toString("base64url");

    const result = verifyLicenseToken(`${header}.${forged}.${signature}`);
    expect(result).toEqual({ ok: false, reason: "signature" });
  });

  it("expires the token on its own clock, not the license", () => {
    const signed = token();
    const { exp } = JSON.parse(
      Buffer.from(signed.split(".")[1], "base64url").toString("utf8"),
    ) as { exp: number };

    expect(verifyLicenseToken(signed, new Date(exp * 1000 - 1000)).ok).toBe(true);
    expect(verifyLicenseToken(signed, new Date(exp * 1000))).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("accepts a token signed with the previous key during a rotation", () => {
    const oldToken = token();
    expect(verifyLicenseToken(oldToken).ok).toBe(true);

    installation.previous = installation.current;
    installation.current = makeKey();
    vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY", installation.current);
    vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS", installation.previous);

    expect(verifyLicenseToken(oldToken).ok).toBe(true);
    expect(verifyLicenseToken(token()).ok).toBe(true);
  });

  it("refuses a token whose key has been rotated out", () => {
    const oldToken = token();
    vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY", makeKey());
    vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS", "");

    expect(verifyLicenseToken(oldToken)).toEqual({ ok: false, reason: "signature" });
  });

  it("refuses malformed input without throwing", () => {
    expect(verifyLicenseToken("not-a-token")).toEqual({ ok: false, reason: "malformed" });
    expect(verifyLicenseToken("a.b")).toEqual({ ok: false, reason: "malformed" });
    expect(verifyLicenseToken("!!!.???.###")).toEqual({ ok: false, reason: "malformed" });
  });

  it("publishes a key an app can verify offline with", () => {
    const signed = token();
    const [published] = publicKeys();

    expect(published.algorithm).toBe("Ed25519");
    expect(published.pem).toContain("BEGIN PUBLIC KEY");

    const [header, body, signature] = signed.split(".");
    const valid = verify(
      null,
      Buffer.from(`${header}.${body}`),
      published.pem,
      Buffer.from(signature, "base64url"),
    );
    expect(valid).toBe(true);
  });

  it("lists the previous key too, then stops once it is gone", () => {
    expect(publicKeys()).toHaveLength(1);

    installation.previous = installation.current;
    installation.current = makeKey();
    vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY", installation.current);
    vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS", installation.previous);
    expect(publicKeys()).toHaveLength(2);

    vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS", "");
    expect(publicKeys()).toHaveLength(1);
  });
});

describe("offline grace and token lifetime", () => {
  it("defaults to seven days of grace", () => {
    vi.stubEnv("LICENSE_GRACE_DAYS", "");
    expect(graceDays()).toBe(7);
    expect(graceDays("not a number")).toBe(7);

    const issued = new Date("2026-01-01T00:00:00Z");
    expect(graceEndsAt(issued).toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });

  it("honours a configured grace and keeps it sane", () => {
    vi.stubEnv("LICENSE_GRACE_DAYS", "14");
    expect(graceDays()).toBe(14);
    expect(graceEndsAt(new Date("2026-01-01T00:00:00Z")).toISOString()).toBe(
      "2026-01-15T00:00:00.000Z",
    );

    vi.stubEnv("LICENSE_GRACE_DAYS", "0");
    expect(graceDays()).toBe(1);
    vi.stubEnv("LICENSE_GRACE_DAYS", "365");
    expect(graceDays()).toBe(30);
  });

  it("keeps a token short-lived and bounded", () => {
    vi.stubEnv("LICENSE_TOKEN_TTL_HOURS", "");
    expect(tokenTtlSeconds()).toBe(12 * 60 * 60);

    vi.stubEnv("LICENSE_TOKEN_TTL_HOURS", "1");
    expect(tokenTtlSeconds()).toBe(60 * 60);
    vi.stubEnv("LICENSE_TOKEN_TTL_HOURS", "1000");
    expect(tokenTtlSeconds()).toBe(7 * 24 * 60 * 60);
  });
});
