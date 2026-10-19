import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { contentTypeForExtension } from "./policy";

export type StorageDriver = "local" | "vercel-blob";

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
};

export function getStorage(): StorageAdapter {
  return process.env.BLOB_READ_WRITE_TOKEN ? blobStorageAdapter : localStorageAdapter;
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
