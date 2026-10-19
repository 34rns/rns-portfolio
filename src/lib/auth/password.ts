import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  if (expected.length === 0) return false;

  const derived = (await scrypt(password, salt, expected.length)) as Buffer;
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
