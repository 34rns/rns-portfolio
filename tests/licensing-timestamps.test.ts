import { expect, test } from "vitest";
import type { Pool } from "pg";
import { createLicenseStore } from "../src/lib/licensing/transaction-store";

test("database timestamps remain usable after a server bundle returns raw text", async () => {
  const existing = new Date("2026-11-14T09:00:00Z");
  const rows = [{ expires_at: "2026-11-14 11:30:00+02", created_at: existing, paused_at: null, label: "2026-11-14", config: { deadline: "2026-11-14T09:00:00Z" } }];
  const fields = [
    { name: "expires_at", dataTypeID: 1184 }, { name: "created_at", dataTypeID: 1184 },
    { name: "paused_at", dataTypeID: 1184 }, { name: "label", dataTypeID: 25 }, { name: "config", dataTypeID: 3802 },
  ];
  const pool = { connect: async () => ({ query: async () => ({ rows, fields }), release() {} }) } as unknown as Pool;
  const store = createLicenseStore("postgres://localhost/licensing_test", pool);
  await store.read(async tx => {
    const [record] = await tx.query<{ expires_at: Date; created_at: Date; paused_at: null; label: string; config: { deadline: string } }>("SELECT timestamps");
    expect(record.expires_at.getTime()).toBe(Date.parse("2026-11-14T09:30:00Z"));
    expect(record.created_at).toBe(existing);
    expect(record.paused_at).toBeNull();
    expect(record.label).toBe("2026-11-14");
    expect(record.config.deadline).toBe("2026-11-14T09:00:00Z");
  });
});
