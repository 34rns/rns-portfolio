import { randomBytes } from "node:crypto";
import { lookupHash } from "@/lib/security/secrets";

/**
 * The order page URL is the buyer's only credential — no account, no email —
 * so the token is 256 bits from the CSPRNG and is stored as a keyed hash. The
 * plain token is also kept encrypted so an admin can link to the buyer's page.
 */
const TOKEN_BYTES = 32;

/** base64url, 43 characters. */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;

export function generateOrderToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function orderTokenHash(token: string): string {
  return lookupHash(token);
}

/**
 * Rejects malformed tokens before they reach the database, so guessing costs a
 * request rather than a query.
 */
export function normalizeOrderToken(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return TOKEN_PATTERN.test(trimmed) ? trimmed : null;
}
