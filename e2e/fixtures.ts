import { test as base, expect } from "@playwright/test";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { assertTestDatabase } from "../scripts/licensing/check-test-env";

// Each synthetic browser journey starts independently; limiter behavior has DB tests.
export const test = base.extend<{ demoRateState: void }>({
  demoRateState: [async ({ baseURL }, use) => {
    if (baseURL !== "http://localhost:3100") throw new Error("Browser fixtures require the isolated localhost demo.");
    const url="postgres://postgres:isolated-local-test-only@127.0.0.1:55433/licensing_demo";
    assertTestDatabase(url, ""); const pool=new Pool({connectionString:url});
    try {
      await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
      await pool.query("DELETE FROM license_rate_buckets WHERE key LIKE 'staff-login:%' OR key LIKE 'staff-login-fail:%'");
      await pool.query("INSERT INTO admin_members(id,email,name,password_hash,role,app_ids) SELECT '00000000-0000-4000-8000-000000000003','viewer@example.test','Demo viewer',password_hash,'viewer',app_ids FROM admin_members WHERE email='helper@example.test' ON CONFLICT(email) DO NOTHING");
    } finally { await pool.end(); }
    await use();
  }, { auto:true }],
});
export { expect };
