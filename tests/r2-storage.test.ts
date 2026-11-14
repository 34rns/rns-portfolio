import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { startTestPostgres } from "./helpers/licensing-postgres";
import { createLicenseStore } from "@/lib/licensing/transaction-store";
import { createR2Storage, readR2File, type UploadBucket } from "@/lib/uploads/r2-storage";
import { getStorage } from "@/lib/uploads/storage";

let runtime: Awaited<ReturnType<typeof startTestPostgres>>;
let mf: Miniflare;
beforeAll(async () => { runtime = await startTestPostgres(); mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: "export default {fetch(){return new Response('ok')}}", r2Buckets: ["UPLOADS"] })); }, 60000);
afterAll(async () => { vi.unstubAllEnvs(); await mf?.dispose(); await runtime?.stop(); });

it("persists uploaded bytes, refuses overwrite and atomically caps concurrent storage", async () => {
  const bucket = await mf.getR2Bucket("UPLOADS") as unknown as UploadBucket;
  const adapter = createR2Storage(bucket, createLicenseStore(runtime.url, runtime.pool), 10);
  const writes = await Promise.allSettled(Array.from({ length: 5 }, (_, i) => adapter.put({ key: `image/test/${i}.png`, data: new Uint8Array([1,2,3,4]), contentType: "image/png" })));
  expect(writes.filter(r => r.status === "fulfilled")).toHaveLength(2);
  const objects = await bucket.list();
  expect(objects.objects.reduce((sum, o) => sum + o.size, 0)).toBe(8);
  const key = objects.objects[0].key;
  expect((await readR2File(bucket, key.split("/")))?.data).toEqual(Buffer.from([1,2,3,4]));
  await expect(adapter.put({ key, data: new Uint8Array([0]), contentType: "image/png" })).rejects.toThrow();
  await adapter.remove(key); await adapter.remove(key);
  expect(await readR2File(bucket, key.split("/"))).toBeNull();
  expect(await readR2File(bucket, ["..", "secret.png"])).toBeNull();
});

it("refuses an unbound R2 driver and hosted local disk without falling back", () => {
  vi.stubEnv("STORAGE_PROVIDER", "r2");
  expect(() => getStorage()).toThrow();
  vi.stubEnv("STORAGE_PROVIDER", "local"); vi.stubEnv("CF_WORKER_CONTEXT", "true");
  expect(() => getStorage()).toThrow();
});
