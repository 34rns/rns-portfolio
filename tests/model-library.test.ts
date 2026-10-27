import { afterEach, describe, expect, it, vi } from "vitest";
import { replaceModelFile, removeModel } from "@/lib/models/service";

const session = vi.hoisted(() => ({ current: null as unknown }));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => session.current),
}));

vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/portfolio");
const { POST: createModel } = await import("@/app/api/admin/models/route");
import { describeUsage, type ModelRecord } from "@/lib/models/store";
import { cleanModelName, isModelUrl } from "@/lib/models/validate";
import { createMemoryModelStore } from "./helpers/memory-model-store";

const GLB = "https://store.public.blob.vercel-storage.com/model/2026-01/one.glb";
const OTHER_GLB = "https://store.public.blob.vercel-storage.com/model/2026-01/two.glb";

function seedModel(overrides: Partial<ModelRecord> = {}): ModelRecord {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "model_1",
    name: "Hero robot",
    url: GLB,
    size: 1024,
    contentType: "model/gltf-binary",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("model urls and names", () => {
  it("accepts uploads and nothing else", () => {
    expect(isModelUrl(GLB)).toBe(true);
    expect(isModelUrl("/api/uploads/model/2026-01/one.glb")).toBe(true);
    expect(isModelUrl("https://example.com/scene.gltf?token=abc")).toBe(true);

    expect(isModelUrl("https://example.com/cover.png")).toBe(false);
    expect(isModelUrl("/api/uploads/image/2026-01/one.png")).toBe(false);
    expect(isModelUrl("data:model/gltf-binary;base64,AAAA")).toBe(false);
    expect(isModelUrl("")).toBe(false);
  });

  it("keeps a name readable", () => {
    expect(cleanModelName("  Robot  ", "fallback")).toBe("Robot");
    expect(cleanModelName("", "fallback")).toBe("fallback");
    expect(cleanModelName(undefined, "fallback")).toBe("fallback");
    expect(cleanModelName("x".repeat(400), "fallback")).toHaveLength(120);
  });
});

describe("replacing a file", () => {
  it("moves the row, rewrites the projects, then removes the old file", async () => {
    const removed: string[] = [];
    const { store, projects } = createMemoryModelStore({
      models: [seedModel()],
      projects: [
        { id: "project_1", title: "One", slug: "one", modelUrl: GLB },
        { id: "project_2", title: "Two", slug: "two", modelUrl: GLB },
        { id: "project_3", title: "Three", slug: "three", modelUrl: null },
      ],
    });

    const result = await replaceModelFile(store, {
      id: "model_1",
      url: OTHER_GLB,
      size: 2048,
      removeFile: async (url) => {
        removed.push(url);
      },
    });

    expect(result).toEqual({ ok: true, reassigned: 2 });
    expect(removed).toEqual([GLB]);
    expect(projects.get("project_1")?.modelUrl).toBe(OTHER_GLB);
    expect(projects.get("project_2")?.modelUrl).toBe(OTHER_GLB);
    expect((await store.findModel("model_1"))?.url).toBe(OTHER_GLB);
  });

  it("does not touch project references when the url did not change", async () => {
    const removed: string[] = [];
    const { store } = createMemoryModelStore({
      models: [seedModel()],
      projects: [{ id: "project_1", title: "One", slug: "one", modelUrl: GLB }],
    });

    const result = await replaceModelFile(store, {
      id: "model_1",
      url: GLB,
      size: 4096,
      removeFile: async (url) => {
        removed.push(url);
      },
    });

    expect(result).toEqual({ ok: true, reassigned: 0 });
    expect(removed).toEqual([]);
    expect((await store.findModel("model_1"))?.size).toBe(4096);
  });

  it("reports a missing model instead of failing silently", async () => {
    const { store } = createMemoryModelStore();
    expect(await replaceModelFile(store, { id: "nope", url: OTHER_GLB, size: 1 })).toMatchObject({
      ok: false,
      status: 404,
    });
  });
});

describe("deleting a file", () => {
  it("asks first when a project still shows it, and lists which", async () => {
    const removed: string[] = [];
    const { store, models } = createMemoryModelStore({
      models: [seedModel()],
      projects: [
        { id: "project_1", title: "One", slug: "one", modelUrl: GLB },
        { id: "project_2", title: "Two", slug: "two", modelUrl: GLB },
      ],
    });

    const result = await removeModel(store, {
      id: "model_1",
      removeFile: async (url) => {
        removed.push(url);
      },
    });

    expect(result).toMatchObject({ ok: false, needsConfirmation: true });
    if (result.ok || !result.needsConfirmation) throw new Error("expected a confirmation request");
    expect(result.usage.map((entry) => entry.projectTitle)).toEqual(["One", "Two"]);
    expect(models.has("model_1")).toBe(true);
    expect(removed).toEqual([]);
  });

  it("detaches the projects once the delete is confirmed", async () => {
    const removed: string[] = [];
    const { store, models, projects } = createMemoryModelStore({
      models: [seedModel()],
      projects: [{ id: "project_1", title: "One", slug: "one", modelUrl: GLB }],
    });

    const result = await removeModel(store, {
      id: "model_1",
      force: true,
      removeFile: async (url) => {
        removed.push(url);
      },
    });

    expect(result).toMatchObject({ ok: true, detached: 1, slugs: ["one"] });
    expect(projects.get("project_1")?.modelUrl).toBeNull();
    expect(models.has("model_1")).toBe(false);
    expect(removed).toEqual([GLB]);
  });

  it("deletes an unused file without a confirmation step", async () => {
    const removed: string[] = [];
    const { store } = createMemoryModelStore({ models: [seedModel()] });

    const result = await removeModel(store, {
      id: "model_1",
      removeFile: async (url) => {
        removed.push(url);
      },
    });

    expect(result).toMatchObject({ ok: true, detached: 0 });
    expect(removed).toEqual([GLB]);
  });

  it("still deletes the row when the stored file is already gone", async () => {
    const { store, models } = createMemoryModelStore({ models: [seedModel()] });

    const result = await removeModel(store, {
      id: "model_1",
      removeFile: async () => {
        throw new Error("gone");
      },
    });

    expect(result).toMatchObject({ ok: true });
    expect(models.has("model_1")).toBe(false);
  });

  it("reports a model that is already gone", async () => {
    const { store } = createMemoryModelStore();
    expect(await removeModel(store, { id: "nope" })).toMatchObject({
      ok: false,
      needsConfirmation: false,
      status: 404,
    });
  });
});

describe("usage", () => {
  it("matches projects by url, not by name", () => {
    const usage = [
      { url: GLB, projectId: "1", projectTitle: "One", projectSlug: "one" },
      { url: OTHER_GLB, projectId: "2", projectTitle: "Two", projectSlug: "two" },
    ];

    expect(describeUsage(usage, GLB).map((entry) => entry.projectId)).toEqual(["1"]);
    expect(describeUsage(usage, "nothing.glb")).toEqual([]);
  });
});

function createRequest(body: unknown) {
  return new Request("http://localhost:3000/api/admin/models", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("the model admin surface", () => {
  it("rejects a signed-out caller and a visitor", async () => {
    const body = { name: "Robot", url: GLB, size: 10 };

    session.current = null;
    expect((await createModel(createRequest(body))).status).toBe(401);

    session.current = { user: { id: "u1", email: "visitor@example.com", role: "customer" } };
    expect((await createModel(createRequest(body))).status).toBe(403);
  });

  it("refuses a file that is not a model even for an admin", async () => {
    session.current = { user: { id: "u1", email: "admin@example.com", role: "admin" } };

    const response = await createModel(
      createRequest({ name: "Cover", url: "https://example.com/cover.png" }),
    );

    expect(response.status).toBe(400);
  });
});
