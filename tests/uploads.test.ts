import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  UPLOAD_POLICY,
  validateUpload,
  validateUploadToken,
} from "@/lib/uploads/policy";
import {
  localStorageAdapter,
  readLocalUpload,
  resolveLocalKey,
} from "@/lib/uploads/storage";

const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

function jpeg(): Uint8Array {
  return Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
}

function glb(declaredLength?: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x67, 0x6c, 0x54, 0x46], 0);
  const view = new DataView(bytes.buffer);
  view.setUint32(4, 2, true);
  view.setUint32(8, declaredLength ?? bytes.length, true);
  return bytes;
}

function gltf(document: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(document));
}

describe("validateUpload", () => {
  it("accepts a real PNG and keys it by kind", () => {
    const result = validateUpload({ name: "cover.png", type: "image/png", bytes: PNG });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.upload.kind).toBe("image");
    expect(result.upload.extension).toBe("png");
    expect(result.upload.contentType).toBe("image/png");
    expect(result.upload.key).toMatch(/^image\/\d{4}-\d{2}\/[\w-]+\.png$/);
  });

  it("accepts a JPEG uploaded as .jpeg and normalises the extension", () => {
    const result = validateUpload({
      name: "photo.jpeg",
      type: "image/jpeg",
      bytes: jpeg(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.upload.extension).toBe("jpg");
  });

  it("rejects a file whose contents do not match its extension", () => {
    const result = validateUpload({ name: "fake.jpg", type: "image/jpeg", bytes: PNG });

    expect(result.ok).toBe(false);
  });

  it("rejects a file with no supported signature", () => {
    const result = validateUpload({
      name: "notes.png",
      type: "image/png",
      bytes: new TextEncoder().encode("<svg></svg>"),
    });

    expect(result.ok).toBe(false);
  });

  it("rejects a declared MIME type that contradicts the extension", () => {
    const result = validateUpload({
      name: "cover.png",
      type: "image/jpeg",
      bytes: PNG,
    });

    expect(result.ok).toBe(false);
  });

  it("rejects an empty file and one over the image limit", () => {
    expect(
      validateUpload({ name: "empty.png", type: "image/png", bytes: new Uint8Array() }).ok,
    ).toBe(false);

    const huge = new Uint8Array(UPLOAD_POLICY.image.maxBytes + 1);
    huge.set(PNG);
    expect(
      validateUpload({ name: "huge.png", type: "image/png", bytes: huge }).ok,
    ).toBe(false);
  });

  it("accepts a complete glTF 2.0 binary", () => {
    const result = validateUpload({ name: "scene.glb", bytes: glb() });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.upload.kind).toBe("model");
    expect(result.upload.contentType).toBe("model/gltf-binary");
    expect(result.upload.key).toMatch(/^model\//);
  });

  it("rejects a truncated .glb", () => {
    const result = validateUpload({ name: "scene.glb", bytes: glb(999) });

    expect(result.ok).toBe(false);
  });

  it("accepts a self-contained glTF and rejects external resources", () => {
    const embedded = validateUpload({
      name: "scene.gltf",
      type: "model/gltf+json",
      bytes: gltf({
        asset: { version: "2.0" },
        buffers: [{ uri: "data:application/octet-stream;base64,AAAA" }],
      }),
    });
    expect(embedded.ok).toBe(true);

    const external = validateUpload({
      name: "scene.gltf",
      bytes: gltf({
        asset: { version: "2.0" },
        buffers: [{ uri: "scene.bin" }],
      }),
    });
    expect(external.ok).toBe(false);
  });

  it("rejects glTF 1.0 documents", () => {
    const result = validateUpload({
      name: "scene.gltf",
      bytes: gltf({ asset: { version: "1.0" } }),
    });

    expect(result.ok).toBe(false);
  });

  it("rejects a file with no extension", () => {
    expect(validateUpload({ name: "cover", bytes: PNG }).ok).toBe(false);
  });
});

describe("validateUploadToken", () => {
  it("signs a plausible image upload", () => {
    const result = validateUploadToken({
      name: "cover.png",
      type: "image/png",
      size: 4096,
      head: PNG,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.upload.kind).toBe("image");
  });

  it("signs a plausible glTF upload from its first bytes", () => {
    const head = new TextEncoder().encode('{"asset":');
    const result = validateUploadToken({
      name: "scene.gltf",
      size: 2048,
      head,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.upload.kind).toBe("model");
  });

  it("refuses disallowed extensions and oversized files", () => {
    expect(
      validateUploadToken({ name: "cover.svg", size: 100, head: PNG }).ok,
    ).toBe(false);

    expect(
      validateUploadToken({
        name: "scene.glb",
        size: UPLOAD_POLICY.model.maxBytes + 1,
        head: glb(),
      }).ok,
    ).toBe(false);
  });

  it("refuses bytes that disagree with the extension", () => {
    expect(
      validateUploadToken({ name: "cover.png", size: 100, head: jpeg() }).ok,
    ).toBe(false);
  });
});

describe("local storage driver", () => {
  const dirs: string[] = [];

  afterEach(async () => {
    delete process.env.UPLOAD_DIR;
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function tempRoot() {
    const dir = await mkdtemp(path.join(tmpdir(), "portfolio-uploads-"));
    dirs.push(dir);
    process.env.UPLOAD_DIR = dir;
    return dir;
  }

  it("writes a file and serves it back through the read helper", async () => {
    await tempRoot();
    const stored = await localStorageAdapter.put({
      key: "image/2026-10/abc.png",
      data: PNG,
      contentType: "image/png",
    });

    expect(stored.url).toBe("/api/uploads/image/2026-10/abc.png");

    const read = await readLocalUpload(["image", "2026-10", "abc.png"]);
    expect(read?.contentType).toBe("image/png");
    expect(Array.from(read?.data ?? [])).toEqual(Array.from(PNG));
  });

  it("refuses a path outside the root even if it exists", async () => {
    await tempRoot();
    expect(await readLocalUpload(["..", "package.json"])).toBeNull();
  });

  it("accepts a relative UPLOAD_DIR", async () => {
    const dir = await tempRoot();
    process.env.UPLOAD_DIR = path.relative(process.cwd(), dir);

    await localStorageAdapter.put({
      key: "model/2026-10/scene.glb",
      data: glb(),
      contentType: "model/gltf-binary",
    });

    expect(await readLocalUpload(["model", "2026-10", "scene.glb"])).not.toBeNull();
  });
});

describe("resolveLocalKey", () => {
  it("keeps generated keys inside the upload root", () => {
    expect(resolveLocalKey(["image", "2026-10", "abc.png"])).toBe(
      "image/2026-10/abc.png",
    );
  });

  it("refuses traversal and hidden segments", () => {
    expect(resolveLocalKey(["..", "etc", "passwd"])).toBeNull();
    expect(resolveLocalKey(["image", "..", "secret.png"])).toBeNull();
    expect(resolveLocalKey([".env"])).toBeNull();
    expect(resolveLocalKey([])).toBeNull();
    expect(resolveLocalKey(["a/b.png"])).toBeNull();
  });
});
