export type UploadKind = "image" | "model";

export type UploadPolicy = {
  label: string;
  maxBytes: number;
  extensions: string[];
  accept: string;
};

export const UPLOAD_POLICY: Record<UploadKind, UploadPolicy> = {
  image: {
    label: "images",
    maxBytes: 8 * 1024 * 1024,
    extensions: ["png", "jpg", "jpeg", "webp", "gif", "avif"],
    accept: "image/png,image/jpeg,image/webp,image/gif,image/avif",
  },
  model: {
    label: "3D models",
    maxBytes: 40 * 1024 * 1024,
    extensions: ["glb", "gltf"],
    accept: ".glb,.gltf,model/gltf-binary,model/gltf+json",
  },
};

const MIME_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
};

const DECLARED_TYPES: Record<string, string[]> = {
  png: ["image/png"],
  jpg: ["image/jpeg", "image/jpg"],
  jpeg: ["image/jpeg", "image/jpg"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  avif: ["image/avif"],
  glb: ["model/gltf-binary", "application/octet-stream", "application/gltf-binary"],
  gltf: ["model/gltf+json", "application/json", "application/octet-stream"],
};

export type ValidatedUpload = {
  kind: UploadKind;
  extension: string;
  contentType: string;
  key: string;
  size: number;
};

export type ValidationResult =
  | { ok: true; upload: ValidatedUpload }
  | { ok: false; error: string };

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((value, index) => bytes[offset + index] === value);
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function extensionOf(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name.trim());
  return match ? match[1].toLowerCase() : "";
}

type Detected = { extension: string; contentType: string };

function detect(bytes: Uint8Array): Detected | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { extension: "png", contentType: "image/png" };
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) {
    return { extension: "gif", contentType: "image/gif" };
  }
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes.length >= 12 &&
    ascii(bytes, 8, 4) === "WEBP"
  ) {
    return { extension: "webp", contentType: "image/webp" };
  }
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4);
    if (brand === "avif" || brand === "avis") {
      return { extension: "avif", contentType: "image/avif" };
    }
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "glTF") {
    return { extension: "glb", contentType: "model/gltf-binary" };
  }
  return null;
}

function looksLikeJson(bytes: Uint8Array): boolean {
  let index = 0;
  if (startsWith(bytes, [0xef, 0xbb, 0xbf])) index = 3;
  while (index < bytes.length && [0x20, 0x09, 0x0a, 0x0d].includes(bytes[index])) {
    index += 1;
  }
  return bytes[index] === 0x7b;
}

function validateGltfJson(bytes: Uint8Array): string | null {
  let text: string;
  try {
    text = new TextDecoder().decode(bytes);
  } catch {
    return "That file is not a readable glTF document.";
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return "That .gltf file is not valid JSON.";
  }

  const doc = json as {
    asset?: { version?: unknown };
    buffers?: { uri?: unknown }[];
    images?: { uri?: unknown }[];
  };

  if (typeof doc.asset?.version !== "string" || !doc.asset.version.startsWith("2")) {
    return "Only glTF 2.0 files are supported.";
  }

  const external = [...(doc.buffers ?? []), ...(doc.images ?? [])].find(
    (entry) =>
      typeof entry.uri === "string" && !entry.uri.startsWith("data:"),
  );
  if (external) {
    return "Use a .glb, or a .gltf with embedded data. External .bin and texture files are not uploaded.";
  }

  return null;
}

function checkSize(size: number, kind: UploadKind): string | null {
  if (size <= 0) return "That file is empty.";
  if (size > UPLOAD_POLICY[kind].maxBytes) {
    const limit = Math.round(UPLOAD_POLICY[kind].maxBytes / (1024 * 1024));
    return `Keep ${UPLOAD_POLICY[kind].label} under ${limit} MB.`;
  }
  return null;
}

/**
 * The browser and the server share this check. The server always re-runs it
 * against the bytes it received; nothing trusts the filename alone.
 */
export function validateUpload({
  name,
  type,
  bytes,
}: {
  name: string;
  type?: string | null;
  bytes: Uint8Array;
}): ValidationResult {
  const declaredExtension = extensionOf(name);
  if (!declaredExtension) {
    return { ok: false, error: "That file has no extension." };
  }

  const kind: UploadKind = declaredExtension === "glb" || declaredExtension === "gltf" ? "model" : "image";
  const sizeError = checkSize(bytes.length, kind);
  if (sizeError) return { ok: false, error: sizeError };

  const detected = detect(bytes);
  const isGltf = declaredExtension === "gltf" && looksLikeJson(bytes);

  if (!detected && !isGltf) {
    return {
      ok: false,
      error: "That file is not a supported image, .glb or .gltf.",
    };
  }

  const actualExtension = detected?.extension ?? "gltf";
  const aliases: Record<string, string[]> = {
    jpg: ["jpg", "jpeg"],
    jpeg: ["jpg", "jpeg"],
    gltf: ["gltf"],
    glb: ["glb"],
    png: ["png"],
    webp: ["webp"],
    gif: ["gif"],
    avif: ["avif"],
  };

  if (!(aliases[actualExtension] ?? [actualExtension]).includes(declaredExtension)) {
    return { ok: false, error: "The file extension does not match its contents." };
  }

  if (type) {
    const allowed = DECLARED_TYPES[declaredExtension] ?? [];
    if (allowed.length > 0 && !allowed.includes(type) && type !== "application/octet-stream") {
      return { ok: false, error: "The file type does not match its contents." };
    }
  }

  if (actualExtension === "glb") {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const version = view.getUint32(4, true);
    const declaredLength = view.getUint32(8, true);
    if (version !== 2) {
      return { ok: false, error: "Only glTF 2.0 binary files are supported." };
    }
    if (declaredLength !== bytes.length) {
      return { ok: false, error: "That .glb looks truncated or corrupted." };
    }
  }

  if (actualExtension === "gltf") {
    const error = validateGltfJson(bytes);
    if (error) return { ok: false, error };
  }

  const extension = declaredExtension === "jpeg" ? "jpg" : declaredExtension;
  const contentType = MIME_BY_EXTENSION[extension] ?? "application/octet-stream";

  return {
    ok: true,
    upload: {
      kind,
      extension,
      contentType,
      key: makeUploadKey(kind, extension),
      size: bytes.length,
    },
  };
}

/**
 * Blob client uploads never pass through a function body, so the token route
 * only sees a filename, a size and the first bytes. Validate what is available
 * before signing the upload; the admin-only surface and Blob's own type/size
 * limits cover the rest.
 */
export function validateUploadToken({
  name,
  type,
  size,
  head,
}: {
  name: string;
  type?: string | null;
  size: number;
  head: Uint8Array;
}): ValidationResult {
  const extension = extensionOf(name);
  const kind: UploadKind = extension === "glb" || extension === "gltf" ? "model" : "image";

  const sizeError = checkSize(size, kind);
  if (sizeError) return { ok: false, error: sizeError };

  const declared = DECLARED_TYPES[extension];
  if (!declared) return { ok: false, error: "That file type is not allowed." };
  if (type && !declared.includes(type) && type !== "application/octet-stream") {
    return { ok: false, error: "The file type does not match its extension." };
  }

  const detected = detect(head);
  const isGltf = extension === "gltf" && looksLikeJson(head);
  if (!detected && !isGltf) {
    return { ok: false, error: "That file is not a supported image, .glb or .gltf." };
  }
  if (detected && detected.extension !== extension && !(detected.extension === "jpg" && extension === "jpeg")) {
    return { ok: false, error: "The file extension does not match its contents." };
  }

  const normalized = extension === "jpeg" ? "jpg" : extension;
  return {
    ok: true,
    upload: {
      kind,
      extension: normalized,
      contentType: MIME_BY_EXTENSION[normalized] ?? "application/octet-stream",
      key: makeUploadKey(kind, normalized),
      size,
    },
  };
}

export function makeUploadKey(kind: UploadKind, extension: string): string {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${kind}/${now.getUTCFullYear()}-${month}/${crypto.randomUUID()}.${extension}`;
}

export function contentTypeForExtension(extension: string): string | null {
  return MIME_BY_EXTENSION[extension.toLowerCase()] ?? null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
