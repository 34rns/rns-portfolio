import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getLicenseStore, type AppStore } from "../licensing/transaction-store";
import { checkSharedLimit } from "../licensing/shared-limits";
import { contentTypeForExtension } from "./policy";
import type { StorageAdapter } from "./storage";

export type UploadBucket = {
  list(options?: { limit?: number }): Promise<{ objects: { key: string; size: number }[]; truncated: boolean }>;
  head(key: string): Promise<unknown>;
  put(key: string, data: Uint8Array, options?: { httpMetadata: { contentType: string } }): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
  delete(key: string): Promise<void>;
};
const safeKey = (segments: string[]) => segments.length > 0 && segments.length <= 6 && segments.every(s => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(s));

export function uploadBucket(): UploadBucket {
  const env = getCloudflareContext().env as unknown as { PORTFOLIO_UPLOADS?: UploadBucket };
  if (!env.PORTFOLIO_UPLOADS) throw new Error("PORTFOLIO_UPLOADS binding is missing.");
  return env.PORTFOLIO_UPLOADS;
}

export function createR2Storage(bucket: UploadBucket, store: AppStore = getLicenseStore(), maxBytes = 8 * 1024 ** 3): StorageAdapter {
  return {
    driver: "r2", direct: false,
    async put({ key, data, contentType }) {
      if (!safeKey(key.split("/"))) throw new Error("Invalid upload key.");
      const now = new Date();
      await checkSharedLimit(store, `r2-writes:${now.toISOString().slice(0,7)}`, 50000, 32 * 86400, now);
      await store.transaction(async sql => {
        // Hold one cross-process lock while checking and writing the dedicated bucket.
        await sql.query("SELECT pg_advisory_xact_lock(72104628)");
        const files = await bucket.list({ limit: 1000 });
        if (files.truncated || files.objects.length >= 1000 || files.objects.reduce((sum, o) => sum + o.size, 0) + data.byteLength > maxBytes) throw new Error("Upload storage limit reached. Remove unused files first.");
        if (await bucket.head(key)) throw new Error("An upload with that key already exists.");
        await bucket.put(key, data, { httpMetadata: { contentType } });
      });
      return { driver: "r2", key, url: `/api/uploads/r2/${key.split("/").map(encodeURIComponent).join("/")}`, size: data.byteLength, contentType };
    },
    async remove(key) { if (!safeKey(key.split("/"))) return; await bucket.delete(key); },
  };
}

export async function readR2File(bucket: UploadBucket, segments: string[]): Promise<{ data: Buffer; contentType: string } | null> {
  if (!safeKey(segments)) return null;
  const contentType = contentTypeForExtension(segments.at(-1)?.split(".").at(-1) ?? "");
  if (!contentType) return null;
  const file = await bucket.get(segments.join("/"));
  return file ? { data: Buffer.from(await file.arrayBuffer()), contentType } : null;
}
