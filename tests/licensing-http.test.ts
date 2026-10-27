import { generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLicenseForAdmin } from "@/lib/licensing/admin";
import { corsHeaders, isAllowedOrigin } from "@/lib/licensing/cors";
import {
  checkLicenseRequest,
  recordLicenseFailure,
  recordLicenseSuccess,
  resetLicenseLimits,
} from "@/lib/licensing/limits";
import { createMemoryLicenseStore } from "./helpers/memory-license-store";

const holder = vi.hoisted(() => ({ store: null as unknown }));

vi.mock("@/lib/licensing/db-store", () => ({
  get dbLicenseStore() {
    return holder.store;
  },
}));

const ORIGIN = "https://app.example.com";
const EXTENSION = "chrome-extension://abcdefghijklmnop";
const IP = "203.0.113.9";

const { POST: activate } = await import("@/app/api/license/activate/route");
const { POST: verify } = await import("@/app/api/license/verify/route");
const { OPTIONS: preflight, POST: preflightPost } = await import("@/app/api/license/activate/route");
const { GET: publicKey } = await import("@/app/api/license/public-key/route");

beforeEach(() => {
  const { privateKey } = generateKeyPairSync("ed25519");
  vi.stubEnv("LICENSE_SECRET", "vitest-license-secret-that-is-long-enough");
  vi.stubEnv(
    "LICENSE_TOKEN_PRIVATE_KEY",
    privateKey.export({ format: "der", type: "pkcs8" }).toString("base64"),
  );
  vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS", "");
  vi.stubEnv("ALLOWED_ORIGINS", `${ORIGIN},${EXTENSION}`);
  resetLicenseLimits();
  holder.store = createMemoryLicenseStore().store;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function request(
  path: "activate" | "verify",
  body: unknown,
  { origin = ORIGIN, ip = IP }: { origin?: string | null; ip?: string } = {},
) {
  const headers = new Headers({ "content-type": "application/json", "x-forwarded-for": ip });
  if (origin) headers.set("origin", origin);
  return new Request(`http://localhost:3000/api/license/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function issueKey(maxDevices = 2) {
  const result = await createLicenseForAdmin(holder.store as never, {
    projectSlugs: ["paid-project"],
    type: "permanent",
    maxDevices,
    actorEmail: "admin@example.com",
  });
  if (!result.ok) throw new Error(result.error);
  return result.key;
}

describe("CORS", () => {
  it("allows only listed origins", () => {
    expect(isAllowedOrigin(ORIGIN)).toBe(true);
    expect(isAllowedOrigin(EXTENSION)).toBe(true);
    expect(isAllowedOrigin("https://evil.example.com")).toBe(false);
    expect(isAllowedOrigin("http://localhost:3000")).toBe(false);
  });

  it("lets a desktop app through when there is no Origin at all", () => {
    expect(isAllowedOrigin(null)).toBe(true);
    // No Origin means no browser CORS, so nothing is echoed back.
    expect(corsHeaders(null)).toEqual({});
  });

  it("never answers with a wildcard", () => {
    const headers = corsHeaders(ORIGIN);
    expect(headers["access-control-allow-origin"]).toBe(ORIGIN);
    expect(Object.values(headers)).not.toContain("*");
    expect(corsHeaders("https://evil.example.com")).toEqual({});
  });

  it("answers a preflight, and refuses an unlisted origin", async () => {
    const allowed = await preflight(
      new Request("http://localhost:3000/api/license/activate", {
        method: "OPTIONS",
        headers: { origin: EXTENSION },
      }),
    );
    expect(allowed.status).toBe(204);
    expect(allowed.headers.get("access-control-allow-origin")).toBe(EXTENSION);

    const refused = await preflight(
      new Request("http://localhost:3000/api/license/activate", {
        method: "OPTIONS",
        headers: { origin: "https://evil.example.com" },
      }),
    );
    expect(refused.status).toBe(403);
    expect(refused.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("refuses a POST from an unlisted origin before any work", async () => {
    const response = await preflightPost(
      request("activate", { key: "x", projectSlug: "paid-project", deviceId: "a" }, {
        origin: "https://evil.example.com",
      }),
    );
    expect(response.status).toBe(403);
  });
});

describe("activate endpoint", () => {
  it("activates a key and hands back a token", async () => {
    const key = await issueKey();

    const response = await activate(
      request("activate", { key, projectSlug: "paid-project", deviceId: "device-1", deviceName: "Laptop" }),
    );
    const body = (await response.json()) as {
      valid: boolean;
      plan: string;
      token: string;
      expiresAt: string | null;
      graceUntil: string;
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.valid).toBe(true);
    expect(body.plan).toBe("pro");
    expect(body.expiresAt).toBeNull();
    expect(body.token.split(".")).toHaveLength(3);
    expect(new Date(body.graceUntil).getTime()).toBeGreaterThan(Date.now());
  });

  it("refreshes with the token from activation", async () => {
    const key = await issueKey();
    const activated = (await (
      await activate(request("activate", { key, projectSlug: "paid-project", deviceId: "device-1" }))
    ).json()) as { token: string };

    const response = await verify(
      request("verify", { token: activated.token, projectSlug: "paid-project", deviceId: "device-1" }),
    );
    const body = (await response.json()) as { valid: boolean; token: string };

    expect(body.valid).toBe(true);
    expect(body.token).toBeTruthy();
  });

  it("answers a bad key without saying whether it exists", async () => {
    const unknown = (await (
      await activate(request("activate", { key: "ABCDE-FGHJK-LMNPQ-RSTUV", projectSlug: "paid-project", deviceId: "a" }))
    ).json()) as { valid: boolean; reason: string; message: string };

    expect(unknown.valid).toBe(false);
    expect(unknown.reason).toBe("invalid_key");
    expect(unknown.message).not.toMatch(/exist|unknown|not found/i);
  });

  it("rejects a body that is missing the project or device", async () => {
    expect((await activate(request("activate", { key: "x", deviceId: "a" }))).status).toBe(400);
    expect((await activate(request("activate", { key: "x", projectSlug: "paid-project" }))).status).toBe(400);
  });

  it("enforces the device limit over HTTP", async () => {
    const key = await issueKey(1);

    const first = (await (
      await activate(request("activate", { key, projectSlug: "paid-project", deviceId: "a" }))
    ).json()) as { valid: boolean };
    const second = (await (
      await activate(request("activate", { key, projectSlug: "paid-project", deviceId: "b" }))
    ).json()) as { valid: boolean; reason: string };

    expect(first.valid).toBe(true);
    expect(second.valid).toBe(false);
    expect(second.reason).toBe("device_limit");
  });
});

describe("rate limiting and lockout", () => {
  it("caps one address", () => {
    // A distinct key each time, so the per-key cap is not what trips first.
    const results = Array.from({ length: 61 }, (_, attempt) =>
      checkLicenseRequest({ ip: IP, keyHash: `${attempt}`.padEnd(64, "a") }),
    );

    expect(results.filter((result) => result.allowed)).toHaveLength(60);
    const blocked = results[60];
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.reason).toBe("rate_limit");
      expect(blocked.retryAfterMs).toBeGreaterThan(0);
    }
  });

  it("caps one key across addresses", () => {
    const keyHash = "b".repeat(64);
    for (let attempt = 0; attempt < 30; attempt += 1) {
      expect(checkLicenseRequest({ ip: `10.0.0.${attempt}`, keyHash }).allowed).toBe(true);
    }

    const blocked = checkLicenseRequest({ ip: "10.0.0.99", keyHash });
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) expect(blocked.reason).toBe("rate_limit");
  });

  it("locks out an address after ten rejected attempts", () => {
    const keyHash = "c".repeat(64);
    for (let attempt = 0; attempt < 10; attempt += 1) {
      recordLicenseFailure({ ip: IP, keyHash: `attempt-${attempt}` });
    }

    const verdict = checkLicenseRequest({ ip: IP, keyHash: "d".repeat(64) });
    expect(verdict.allowed).toBe(false);
    if (!verdict.allowed) expect(verdict.reason).toBe("lockout");
  });

  it("locks a key tried from many addresses", () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      recordLicenseFailure({ ip: `10.1.0.${attempt}`, keyHash: "e".repeat(64) });
    }

    const verdict = checkLicenseRequest({ ip: "10.2.0.1", keyHash: "e".repeat(64) });
    expect(verdict.allowed).toBe(false);
    if (!verdict.allowed) expect(verdict.reason).toBe("lockout");
  });

  it("clears a good key without clearing everyone else", () => {
    recordLicenseFailure({ ip: IP, keyHash: "f".repeat(64) });
    recordLicenseSuccess({ ip: IP, keyHash: "f".repeat(64) });

    for (let attempt = 0; attempt < 9; attempt += 1) {
      recordLicenseFailure({ ip: IP, keyHash: "f".repeat(64) });
    }
    expect(checkLicenseRequest({ ip: IP, keyHash: "f".repeat(64) }).allowed).toBe(true);
  });

  it("answers 429 with a retry-after once locked out", async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      recordLicenseFailure({ ip: IP, keyHash: `poison-${attempt}` });
    }

    const response = await activate(
      request("activate", { key: "ABCDE-FGHJK-LMNPQ-RSTUV", projectSlug: "paid-project", deviceId: "a" }),
    );

    expect(response.status).toBe(429);
    expect(Number(response.headers.get("retry-after"))).toBeGreaterThan(0);
  });
});

describe("public key endpoint", () => {
  it("publishes the Ed25519 key for offline checks", async () => {
    const response = await publicKey(
      new Request("http://localhost:3000/api/license/public-key", {
        headers: { origin: ORIGIN },
      }),
    );
    const body = (await response.json()) as {
      algorithm: string;
      keys: { kid: string; pem: string }[];
      tokenTtlSeconds: number;
    };

    expect(response.status).toBe(200);
    expect(body.algorithm).toBe("Ed25519");
    expect(body.keys).toHaveLength(1);
    expect(body.keys[0].pem).toContain("BEGIN PUBLIC KEY");
    expect(body.tokenTtlSeconds).toBeGreaterThan(0);
  });

  it("refuses an unlisted origin", async () => {
    const response = await publicKey(
      new Request("http://localhost:3000/api/license/public-key", {
        headers: { origin: "https://evil.example.com" },
      }),
    );
    expect(response.status).toBe(403);
  });
});
