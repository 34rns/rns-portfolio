/**
 * Logical backup of the app's content, taken before a migration.
 *
 *   npm run db:backup
 *
 * Writes every row of every app table to `backups/<timestamp>.json`. It is not a
 * substitute for Neon's point-in-time restore, which is the real safety net; it
 * is the copy you can read, diff and re-insert from if a migration goes wrong.
 * `backups/` is gitignored — it contains buyer emails.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

/** Hardcoded on purpose: a table name is never taken from input. */
const TABLES = [
  "users",
  "projects",
  "purchases",
  "purchase_audit_log",
  "processed_webhook_events",
] as const;

async function main() {
  const { neon } = await import("@neondatabase/serverless");

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Run `vercel env pull .env.local`.");

  // `.query` is the conventional-call form; the tagged template insists on
  // parameters, which a table name cannot be.
  const client = neon(url) as unknown as {
    query: (text: string) => Promise<unknown[]>;
  };
  const tables: Record<string, unknown[]> = {};

  for (const table of TABLES) {
    tables[table] = await client.query(`select * from "${table}"`);
    console.log(`${table}: ${tables[table].length} row(s)`);
  }

  const takenAt = new Date().toISOString();
  const dir = path.join(process.cwd(), "backups");
  await mkdir(dir, { recursive: true });

  const file = path.join(dir, `${takenAt.replace(/[:.]/g, "-")}.json`);
  await writeFile(file, JSON.stringify({ takenAt, tables }, null, 2), "utf8");
  console.log(`\nWrote ${path.relative(process.cwd(), file)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
