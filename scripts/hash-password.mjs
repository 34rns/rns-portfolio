import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password || password.length < 8) {
  console.error('Usage: npm run admin:hash -- "a-password-at-least-8-chars"');
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");

console.log(`${salt}:${hash}`);
