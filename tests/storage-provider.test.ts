import { afterEach, describe, expect, it, vi } from "vitest";
import {
  directUploadsEnabled,
  getStorage,
  resolveStorageDriver,
  StorageNotConfiguredError,
  storageReady,
} from "@/lib/uploads/storage";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveStorageDriver", () => {
  it("honours STORAGE_PROVIDER=blob over a missing token", () => {
    vi.stubEnv("STORAGE_PROVIDER", "blob");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    expect(resolveStorageDriver()).toBe("vercel-blob");
  });

  it("honours STORAGE_PROVIDER=local even with a token present", () => {
    vi.stubEnv("STORAGE_PROVIDER", "local");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_test_123");
    expect(resolveStorageDriver()).toBe("local");
  });

  it("falls back to token presence when STORAGE_PROVIDER is unset", () => {
    vi.stubEnv("STORAGE_PROVIDER", "");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    expect(resolveStorageDriver()).toBe("local");

    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_test_123");
    expect(resolveStorageDriver()).toBe("vercel-blob");
  });

  it("refuses an unknown provider instead of guessing", () => {
    vi.stubEnv("STORAGE_PROVIDER", "s3");
    expect(() => resolveStorageDriver()).toThrow(StorageNotConfiguredError);
  });
});

describe("getStorage when blob is configured without a token", () => {
  it("throws a typed error rather than returning the local driver", () => {
    vi.stubEnv("STORAGE_PROVIDER", "blob");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");

    expect(() => getStorage()).toThrow(StorageNotConfiguredError);
    try {
      getStorage();
    } catch (error) {
      expect(error).toBeInstanceOf(StorageNotConfiguredError);
      expect((error as Error).message).toContain("BLOB_READ_WRITE_TOKEN is missing");
      expect((error as Error).message).toContain("Storage -> Blob");
    }
  });

  it("reports not ready and disables direct uploads", () => {
    vi.stubEnv("STORAGE_PROVIDER", "blob");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");

    expect(storageReady()).toBe(false);
    expect(directUploadsEnabled()).toBe(false);
  });

  it("stays unavailable while STORAGE_PROVIDER itself is broken", () => {
    vi.stubEnv("STORAGE_PROVIDER", "wat");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");

    expect(storageReady()).toBe(false);
    expect(directUploadsEnabled()).toBe(false);
  });
});

describe("getStorage when configured correctly", () => {
  it("uses blob once the token is there", () => {
    vi.stubEnv("STORAGE_PROVIDER", "blob");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_test_123");

    expect(getStorage().driver).toBe("vercel-blob");
    expect(getStorage().direct).toBe(true);
    expect(storageReady()).toBe(true);
    expect(directUploadsEnabled()).toBe(true);
  });

  it("uses local disk for an unpinned checkout with no token", () => {
    vi.stubEnv("STORAGE_PROVIDER", "");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");

    expect(getStorage().driver).toBe("local");
    expect(getStorage().direct).toBe(false);
    expect(storageReady()).toBe(true);
    expect(directUploadsEnabled()).toBe(false);
  });
});
