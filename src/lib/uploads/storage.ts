import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { contentTypeForExtension } from "./policy";
import { createR2Storage, uploadBucket } from "./r2-storage";
import { createNetlifyStorage } from "./netlify-storage";
import { siteUrl } from "../seo";

export type StorageDriver = "local" | "vercel-blob" | "r2" | "netlify-blobs";

/**
 * Raised when the configuration says Blob but the token is not there. The
 * admin routes turn this into a 503 instead of silently falling back to the
 * local driver, because production cannot write to disk and a half-working
 * upload is worse than a refused one.
 */
export class StorageNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageNotConfiguredError";
  }
}

const MISSING_BLOB_TOKEN =
  "Image storage is not configured: STORAGE_PROVIDER is \"blob\" but " +
  "BLOB_READ_WRITE_TOKEN is missing. Connect a Blob store in Vercel " +
  "(Storage -> Blob -> Connect to Project), then redeploy.";

export type StoredFile = {
  driver: StorageDriver;
  url: string;
  key: string;
  size: number;
  contentType: string;
};

export type StorageAdapter = {
  driver: StorageDriver;
  /** True when the browser uploads directly instead of proxying bytes. */
  direct: boolean;
  put(input: {
    key: string;
    data: Uint8Array;
    contentType: string;
  }): Promise<StoredFile>;
  /** Removes one stored key. A missing key is not an error. */
  remove(key: string): Promise<void>;
};

function uploadRoot(): string {
  // Resolve once so a relative UPLOAD_DIR still matches the traversal guard.
  // The ignore comment keeps Turbopack from tracing the whole project when it
  // sees a runtime-configurable path.
  const configured = process.env.UPLOAD_DIR;
  return configured
    ? path.resolve(/* turbopackIgnore: true */ configured)
    : path.join(process.cwd(), "uploads");
}

function publicUrl(key: string): string {
  return `/api/uploads/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * Development default. Files live in a gitignored folder and are served by
 * `/api/uploads`, which is enough for a local checkout but not for Vercel's
 * read-only filesystem.
 */
export const localStorageAdapter: StorageAdapter = {
  driver: "local",
  direct: false,
  async put({ key, data, contentType }) {
    const target = path.join(uploadRoot(), key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
    return {
      driver: "local",
      url: publicUrl(key),
      key,
      size: data.byteLength,
      contentType,
    };
  },
  async remove(key) {
    const root = uploadRoot();
    const target = path.resolve(root, key);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) return;
    await rm(/* turbopackIgnore: true */ target, { force: true });
  },
};

/**
 * Production. The admin UI uploads straight to Blob (Vercel Functions cap a
 * proxied request body at 4.5 MB); `put` stays available for server-side
 * writes and scripts.
 */
export const blobStorageAdapter: StorageAdapter = {
  driver: "vercel-blob",
  direct: true,
  async put({ key, data, contentType }) {
    const blob = await put(key, Buffer.from(data), {
      access: "public",
      contentType,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return {
      driver: "vercel-blob",
      url: blob.url,
      key,
      size: data.byteLength,
      contentType,
    };
  },
  async remove(key) {
    await del(key, { token: process.env.BLOB_READ_WRITE_TOKEN });
  },
};

const LOCAL_URL_PREFIX = "/api/uploads/";

/**
 * Deletes whatever `url` points at, whichever driver stored it. Local URLs are
 * `/api/uploads/<key>`, Blob URLs are absolute and keyed by their pathname.
 */
export async function deleteStoredFile(url: string): Promise<void> {
  const driver = resolveStorageDriver();

  if (/^https:\/\//i.test(url)) {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/api/uploads/netlify/") && parsed.origin === new URL(siteUrl()).origin) url = parsed.pathname;
  }

  if (url.startsWith("/api/uploads/netlify/")) {
    if (driver !== "netlify-blobs") throw new StorageNotConfiguredError("Configure Netlify storage before removing its files.");
    return getStorage().remove(url.slice("/api/uploads/netlify/".length));
  }

  if (url.startsWith("/api/uploads/r2/")) {
    if (driver !== "r2") throw new StorageNotConfiguredError("Configure the R2 upload bucket before removing its files.");
    return getStorage().remove(url.slice("/api/uploads/r2/".length).split("/").map(decodeURIComponent).join("/"));
  }

  if (url.startsWith(LOCAL_URL_PREFIX)) {
    const key = url
      .slice(LOCAL_URL_PREFIX.length)
      .split("/")
      .map(decodeURIComponent)
      .join("/");
    if (driver === "local") return localStorageAdapter.remove(key);
    if (driver === "vercel-blob") return blobStorageAdapter.remove(key);
    return;
  }

  if (/^https?:\/\//i.test(url) && driver === "vercel-blob") {
    return blobStorageAdapter.remove(url);
  }
  if (/^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//i.test(url) && process.env.BLOB_READ_WRITE_TOKEN) return blobStorageAdapter.remove(url);
}

/**
 * Which driver the current environment is meant to use.
 *
 * `STORAGE_PROVIDER` is authoritative when set: production and preview pin it
 * to `blob` so a missing token is a loud failure rather than a silent write to
 * a filesystem that does not survive a deploy. Without it we fall back to
 * token presence, which is what a plain local checkout sees.
 */
export function resolveStorageDriver(): StorageDriver {
  const configured = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
  if (configured === "r2") return "r2";
  if (configured === "netlify" || configured === "netlify-blobs") return "netlify-blobs";
  if (configured === "blob" || configured === "vercel-blob") return "vercel-blob";
  if (configured === "local" || configured === "disk") return "local";
  if (configured) {
    throw new StorageNotConfiguredError(
      `Unknown STORAGE_PROVIDER "${configured}". Use "blob", "r2", "netlify" or "local".`,
    );
  }
  return process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : "local";
}

/** True when the configured driver is usable right now. */
export function storageReady(): boolean {
  try {
    getStorage();
    return true;
  } catch {
    return false;
  }
}

export function getStorage(): StorageAdapter {
  const driver = resolveStorageDriver();
  if (driver === "local" && (process.env.CF_WORKER_CONTEXT === "true" || process.env.NETLIFY === "true")) throw new StorageNotConfiguredError("Hosted uploads require durable storage. Configure Netlify Blobs, R2 or Blob.");
  if (driver === "netlify-blobs") {
    try { return createNetlifyStorage(); } catch { throw new StorageNotConfiguredError("Netlify uploads require the deployed site's Blobs context."); }
  }
  if (driver === "r2") {
    try { return createR2Storage(uploadBucket()); } catch { throw new StorageNotConfiguredError("R2 uploads need PORTFOLIO_UPLOADS and a configured database. No files were written to disk."); }
  }
  if (driver === "vercel-blob" && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new StorageNotConfiguredError(MISSING_BLOB_TOKEN);
  }
  return driver === "vercel-blob" ? blobStorageAdapter : localStorageAdapter;
}

/**
 * Whether the admin form may upload straight to Blob. Never throws: the form
 * falls back to the proxy route, which reports the misconfiguration with a
 * clear status instead of crashing the admin page that renders it.
 */
export function directUploadsEnabled(): boolean {
  try {
    return getStorage().direct;
  } catch {
    return false;
  }
}

const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Resolve a request path inside the upload root, refusing traversal. */
export function resolveLocalKey(segments: string[]): string | null {
  if (segments.length === 0 || segments.length > 6) return null;
  if (!segments.every((segment) => SAFE_SEGMENT.test(segment))) return null;
  return segments.join("/");
}

export async function readLocalUpload(
  segments: string[],
): Promise<{ data: Buffer; contentType: string } | null> {
  const key = resolveLocalKey(segments);
  if (!key) return null;

  const extension = key.split(".").pop() ?? "";
  const contentType = contentTypeForExtension(extension);
  if (!contentType) return null;

  const root = uploadRoot();
  const target = path.resolve(root, key);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) return null;

  try {
    const data = await readFile(/* turbopackIgnore: true */ target);
    return { data, contentType };
  } catch {
    return null;
  }
}
