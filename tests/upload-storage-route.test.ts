import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/upload/route";

const session = vi.hoisted(() => ({ current: null as unknown }));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => session.current),
}));

const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

const adminSession = { user: { id: "u1", email: "admin@example.com", role: "admin" } };

function uploadRequest(): Request {
  const form = new FormData();
  form.set(
    "file",
    new File([new Uint8Array(PNG)], "cover.png", { type: "image/png" }),
  );
  return new Request("http://localhost:3000/api/admin/upload", {
    method: "POST",
    body: form,
  });
}

async function withUploadDir(run: (dir: string) => Promise<void>) {
  const dir = await mkdtemp(path.join(tmpdir(), "upload-route-"));
  vi.stubEnv("UPLOAD_DIR", dir);
  try {
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
    vi.unstubAllEnvs();
    session.current = null;
  }
}

describe("POST /api/admin/upload", () => {
  it("refuses with a clear 503 and never touches disk when blob lacks a token", async () => {
    await withUploadDir(async (dir) => {
      vi.stubEnv("STORAGE_PROVIDER", "blob");
      vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
      session.current = adminSession;

      const response = await POST(uploadRequest());

      expect(response.status).toBe(503);
      const body = (await response.json()) as { error: string };
      expect(body.error).toContain("STORAGE_PROVIDER");
      expect(body.error).toContain("BLOB_READ_WRITE_TOKEN is missing");
      expect(await readdir(dir)).toEqual([]);
    });
  });

  it("still 401s a signed-out caller before storage is even considered", async () => {
    vi.stubEnv("STORAGE_PROVIDER", "blob");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    session.current = null;

    const response = await POST(uploadRequest());
    expect(response.status).toBe(401);
    vi.unstubAllEnvs();
  });

  it("writes to the local driver when no provider is pinned", async () => {
    await withUploadDir(async (dir) => {
      vi.stubEnv("STORAGE_PROVIDER", "");
      vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
      session.current = adminSession;

      const response = await POST(uploadRequest());
      expect(response.status).toBe(201);
      const body = (await response.json()) as { driver: string; url: string };
      expect(body.driver).toBe("local");
      expect(body.url.startsWith("/api/uploads/")).toBe(true);
      expect((await readdir(dir)).length).toBeGreaterThan(0);
    });
  });
});
