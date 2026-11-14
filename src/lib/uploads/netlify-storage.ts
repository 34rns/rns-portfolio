import { getStore } from "@netlify/blobs";
import { netlifyKey } from "./netlify-ticket";
import type { StorageAdapter } from "./storage";
import { siteUrl } from "../seo";

export function netlifyUploads() { return getStore({ name: "portfolio-uploads", consistency: "strong" }); }
export function createNetlifyStorage(blobs = netlifyUploads()): StorageAdapter {
  return {
    driver: "netlify-blobs", direct: true,
    async put({ key, data, contentType }) {
      if (!netlifyKey.test(key)) throw new Error("Invalid upload key.");
      const result = await blobs.set(key, new Blob([new Uint8Array(data)]), { onlyIfNew: true, metadata: { contentType, size: data.byteLength } });
      if (!result.modified) throw new Error("An upload with that key already exists.");
      return { driver: "netlify-blobs", key, url: new URL(`/api/uploads/netlify/${key}`, siteUrl()).href, size: data.byteLength, contentType };
    },
    async remove(key) { if (netlifyKey.test(key)) await blobs.delete(key); },
  };
}
export async function cleanupNetlifyPending() {
  const deadline = Date.now() + 5000;
  const blobs = getStore({ name: "portfolio-uploads", consistency: "strong", fetch: (input, options) => fetch(input, { ...options, signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())) }) });
  const entries = await blobs.list({ prefix: "pending/" });
  let removed = 0;
  for (const entry of entries.blobs.slice(0, 100)) {
    if (Date.now() >= deadline) break;
    const info = await blobs.getMetadata(entry.key);
    if (info && Number(info.metadata.expiresAt) * 1000 < Date.now()) { await blobs.delete(entry.key); removed++; }
  }
  return removed;
}
