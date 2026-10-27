import {
  createHash,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
  type KeyObject,
} from "node:crypto";
import { SecretNotConfiguredError } from "@/lib/security/secrets";

/**
 * Ed25519 tokens signed with `node:crypto` — no extra dependency. The app can
 * verify a token from `/api/license/public-key` without calling us, which is
 * what makes the offline grace period possible.
 */
export type LicenseTokenPayload = {
  v: 1;
  /** Which signing key made this token; lets old tokens outlive a rotation. */
  kid: string;
  /** License id. */
  sub: string;
  projectSlug: string;
  /** Fingerprint of the activating device, never the device id itself. */
  dev: string;
  plan: "pro";
  iat: number;
  /** End of the token itself, in seconds. */
  exp: number;
  /** End of the license, in seconds; null for a permanent key. */
  le: number | null;
};

export type TokenFailure = "malformed" | "signature" | "expired";
export type TokenResult =
  | { ok: true; payload: LicenseTokenPayload }
  | { ok: false; reason: TokenFailure };

const keyCache = new Map<string, KeyObject>();

function parsePrivateKey(raw: string | undefined): KeyObject | null {
  const value = raw?.trim();
  if (!value) return null;

  const cached = keyCache.get(value);
  if (cached) return cached;

  const pem = value.includes("BEGIN");
  const key = createPrivateKey({
    key: pem ? value : Buffer.from(value, "base64"),
    format: pem ? "pem" : "der",
    type: "pkcs8",
  });
  keyCache.set(value, key);
  return key;
}

function keyId(publicDer: Buffer): string {
  return createHash("sha256").update(publicDer).digest("base64url").slice(0, 10);
}

export type SigningKey = {
  kid: string;
  privateKey: KeyObject;
  publicDer: Buffer;
};

/**
 * Current key first, then the previous one while a rotation is in flight.
 * Rotation: generate a pair, ship the new key as `LICENSE_TOKEN_PRIVATE_KEY`
 * and the old one as `LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS`, deploy. Tokens
 * signed with the old key keep verifying for one grace period; drop the
 * previous variable after that.
 */
export function signingKeys(): SigningKey[] {
  const keys: SigningKey[] = [];

  for (const raw of [
    process.env.LICENSE_TOKEN_PRIVATE_KEY,
    process.env.LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS,
  ]) {
    const privateKey = parsePrivateKey(raw);
    if (!privateKey) continue;
    const publicDer = createPublicKey(privateKey).export({ format: "der", type: "spki" });
    keys.push({ kid: keyId(publicDer as Buffer), privateKey, publicDer: publicDer as Buffer });
  }

  return keys;
}

function currentKey(): SigningKey {
  const [key] = signingKeys();
  if (!key) throw new SecretNotConfiguredError("LICENSE_TOKEN_PRIVATE_KEY");
  return key;
}

export function graceDays(value = process.env.LICENSE_GRACE_DAYS): number {
  const parsed = Number.parseInt((value ?? "").trim(), 10);
  if (!Number.isFinite(parsed)) return 7;
  return Math.min(30, Math.max(1, parsed));
}

export function tokenTtlSeconds(value = process.env.LICENSE_TOKEN_TTL_HOURS): number {
  const parsed = Number.parseInt((value ?? "").trim(), 10);
  if (!Number.isFinite(parsed)) return 12 * 60 * 60;
  return Math.min(7 * 24 * 60 * 60, Math.max(60 * 60, parsed * 60 * 60));
}

/** When a cached token stops being honoured at all, offline included. */
export function graceEndsAt(expiresAt: Date, days = graceDays()): Date {
  return new Date(expiresAt.getTime() + days * 24 * 60 * 60 * 1000);
}

export function deviceFingerprint(deviceId: string): string {
  return createHash("sha256").update(deviceId).digest("base64url").slice(0, 22);
}

export function signLicenseToken({
  licenseId,
  projectSlug,
  deviceId,
  licenseExpiresAt,
  now = new Date(),
}: {
  licenseId: string;
  projectSlug: string;
  deviceId: string;
  licenseExpiresAt: Date | null;
  now?: Date;
}): string {
  const key = currentKey();
  const iat = Math.floor(now.getTime() / 1000);

  const payload: LicenseTokenPayload = {
    v: 1,
    kid: key.kid,
    sub: licenseId,
    projectSlug,
    dev: deviceFingerprint(deviceId),
    plan: "pro",
    iat,
    exp: iat + tokenTtlSeconds(),
    le: licenseExpiresAt ? Math.floor(licenseExpiresAt.getTime() / 1000) : null,
  };

  const header = Buffer.from(
    JSON.stringify({ alg: "EdDSA", typ: "JWT", kid: key.kid }),
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(null, Buffer.from(`${header}.${body}`), key.privateKey);

  return `${header}.${body}.${signature.toString("base64url")}`;
}

export function verifyLicenseToken(token: string, now = new Date()): TokenResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };

  const [header, body, signature] = parts;

  let kid = "";
  try {
    const parsed = JSON.parse(Buffer.from(header, "base64url").toString("utf8")) as {
      alg?: string;
      kid?: string;
    };
    if (parsed.alg !== "EdDSA" || !parsed.kid) return { ok: false, reason: "malformed" };
    kid = parsed.kid;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  const key = signingKeys().find((candidate) => candidate.kid === kid);
  // An unknown kid is a signature failure, not a "malformed" one: the token may
  // have been signed with a key that has since been rotated out.
  if (!key) return { ok: false, reason: "signature" };

  const valid = verify(
    null,
    Buffer.from(`${header}.${body}`),
    createPublicKey(key.privateKey),
    Buffer.from(signature, "base64url"),
  );
  if (!valid) return { ok: false, reason: "signature" };

  let payload: LicenseTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as LicenseTokenPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (
    payload.v !== 1 ||
    typeof payload.sub !== "string" ||
    typeof payload.projectSlug !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return { ok: false, reason: "malformed" };
  }

  if (payload.exp * 1000 <= now.getTime()) return { ok: false, reason: "expired" };

  return { ok: true, payload };
}

/** Everything an app needs to check tokens without calling the API. */
export function publicKeys(): { kid: string; algorithm: "Ed25519"; derBase64: string; pem: string }[] {
  return signingKeys().map((key) => ({
    kid: key.kid,
    algorithm: "Ed25519" as const,
    derBase64: key.publicDer.toString("base64"),
    pem: createPublicKey(key.privateKey).export({ format: "pem", type: "spki" }).toString(),
  }));
}
