import { randomInt } from "node:crypto";
import { encryptValue, lookupHash } from "@/lib/security/secrets";

/**
 * Crockford-style alphabet: no I, O, 0 or 1, so a key read off a screenshot or
 * typed from a WhatsApp message cannot be confused. 32 symbols, 20 characters
 * — about 100 bits from the CSPRNG, which is far beyond guessable.
 */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const KEY_LENGTH = 20;
const GROUPS = 4;
const GROUP_SIZE = KEY_LENGTH / GROUPS;

export function generateLicenseKey(): string {
  let raw = "";
  for (let index = 0; index < KEY_LENGTH; index += 1) {
    raw += ALPHABET[randomInt(ALPHABET.length)];
  }
  return formatLicenseKey(raw);
}

/** `abcd-...` -> `ABCD-...`; anything not a key -> null. */
export function normalizeLicenseKey(input: string | null | undefined): string | null {
  const raw = (input ?? "").toUpperCase().replace(/[\s-]/g, "");
  if (raw.length !== KEY_LENGTH) return null;
  for (const character of raw) {
    if (!ALPHABET.includes(character)) return null;
  }
  return formatLicenseKey(raw);
}

export function formatLicenseKey(raw: string): string {
  const groups: string[] = [];
  for (let index = 0; index < raw.length; index += GROUP_SIZE) {
    groups.push(raw.slice(index, index + GROUP_SIZE));
  }
  return groups.join("-");
}

/** HMAC of the normalised key. The raw key is never stored. */
export function licenseKeyLookup(key: string): string {
  return lookupHash(key);
}

export function encryptLicenseKey(key: string): string {
  return encryptValue(key);
}
