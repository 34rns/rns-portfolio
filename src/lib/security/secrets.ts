import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

/**
 * One master secret (`LICENSE_SECRET`) is expanded with HKDF into the two keys
 * the app needs: an HMAC key for the lookup hashes and an AES-256-GCM key for
 * the values kept encrypted at rest. Distinct `info` strings keep the two
 * purposes apart even though both come from the same secret, so a lookup hash
 * can never be turned into a decryption oracle.
 */
export class SecretNotConfiguredError extends Error {
  constructor(variable: string) {
    super(
      `${variable} is not configured. Generate the licensing secrets with ` +
        "`node scripts/license-keys.mjs` and add them to .env.local and to Vercel.",
    );
    this.name = "SecretNotConfiguredError";
  }
}

const LABELS = {
  lookup: "rns-portfolio/lookup-hash/v1",
  encryption: "rns-portfolio/rest-encryption/v1",
} as const;

/** Split material into a 32-byte key without locking the operator into one encoding. */
function decodeKeyMaterial(raw: string): Buffer {
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(raw) && raw.length % 4 === 0) {
    const decoded = Buffer.from(raw, "base64");
    if (decoded.length >= 32) return decoded;
  }
  return Buffer.from(raw, "utf8");
}

function masterSecret(): Buffer {
  const raw = process.env.LICENSE_SECRET?.trim();
  if (!raw) throw new SecretNotConfiguredError("LICENSE_SECRET");

  const material = decodeKeyMaterial(raw);
  if (material.length < 32) {
    throw new Error("LICENSE_SECRET must decode to at least 32 bytes of key material.");
  }
  return material;
}

function derive(label: (typeof LABELS)[keyof typeof LABELS]): Buffer {
  return Buffer.from(
    hkdfSync("sha256", masterSecret(), Buffer.alloc(0), Buffer.from(label, "utf8"), 32),
  );
}

/** True when the licensing secret is present; admin pages use this to explain themselves. */
export function secretsConfigured(): boolean {
  try {
    masterSecret();
    return true;
  } catch {
    return false;
  }
}

/**
 * Keyed lookup hash. The raw value is never stored, logged or put in an index,
 * so a database dump still does not contain usable order links or license keys.
 */
export function lookupHash(value: string): string {
  return createHmac("sha256", derive(LABELS.lookup)).update(value).digest("hex");
}

/** Constant-time comparison for two strings the app produced itself. */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

const IV_BYTES = 12;
const TAG_BYTES = 16;

/** AES-256-GCM. Output is base64 of `iv | auth tag | ciphertext`. */
export function encryptValue(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", derive(LABELS.encryption), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
}

export function decryptValue(payload: string): string {
  const raw = Buffer.from(payload, "base64");
  if (raw.length < IV_BYTES + TAG_BYTES) {
    throw new Error("That stored value is not readable.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    derive(LABELS.encryption),
    raw.subarray(0, IV_BYTES),
  );
  decipher.setAuthTag(raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));

  return Buffer.concat([
    decipher.update(raw.subarray(IV_BYTES + TAG_BYTES)),
    decipher.final(),
  ]).toString("utf8");
}
