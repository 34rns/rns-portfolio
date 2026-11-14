import { getStore } from "@netlify/blobs";
import { verifyUploadTicket, netlifyKey, type UploadPublicKey } from "../../src/lib/uploads/netlify-ticket.ts";
import { contentTypeForExtension, NETLIFY_UPLOAD_CHUNK_BYTES } from "../../src/lib/uploads/policy.ts";
declare const Netlify: { env: { get(name: string): string | undefined } };

export default async function uploads(request: Request) {
  const url = new URL(request.url), blobs = getStore({ name: "portfolio-uploads", consistency: "strong" });
  const headers = { "cache-control": "no-store" };
  if (url.pathname === "/api/admin/upload/netlify-body") {
    if (request.method !== "PUT") return new Response(null, { status: 405, headers });
    try {
      const keys = JSON.parse(Netlify.env.get("NETLIFY_UPLOAD_PUBLIC_KEYS") || "{}").keys as UploadPublicKey[];
      const ticket = await verifyUploadTicket((request.headers.get("authorization") || "").replace(/^Bearer /, ""), keys || []);
      const origin = request.headers.get("origin");
      if (origin && origin !== new URL(Netlify.env.get("NEXT_PUBLIC_SITE_URL") || "").origin) return new Response(null, { status: 403, headers });
      const rawPart = request.headers.get("x-upload-part") || "0";
      if (!/^(0|[1-9][0-9]*)$/.test(rawPart)) return new Response(null, { status: 400, headers });
      const part = Number(rawPart), count = Math.ceil(ticket.size / NETLIFY_UPLOAD_CHUNK_BYTES);
      if (part >= count) return new Response(null, { status: 400, headers });
      const expectedSize = Math.min(NETLIFY_UPLOAD_CHUNK_BYTES, ticket.size - part * NETLIFY_UPLOAD_CHUNK_BYTES);
      if (Number(request.headers.get("content-length")) > expectedSize) return new Response(null, { status: 413, headers });
      const reader = request.body?.getReader(); if (!reader) return new Response(null, { status: 400, headers });
      const chunks: Uint8Array<ArrayBuffer>[] = []; let size = 0;
      while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.length; if (size > expectedSize) { await reader.cancel(); return new Response(null, { status: 413, headers }); } chunks.push(new Uint8Array(chunk.value)); }
      if (size !== expectedSize) return new Response(null, { status: 400, headers });
      const result = await blobs.set(`pending/${ticket.nonce}/${part}`, new Blob(chunks), { onlyIfNew: true, metadata: { expiresAt: ticket.exp } });
      return new Response(null, { status: result.modified ? 201 : 409, headers });
    } catch { return new Response(null, { status: 401, headers }); }
  }
  if (!["GET", "HEAD"].includes(request.method)) return new Response(null, { status: 405 });
  let key: string;
  try { key = decodeURIComponent(url.pathname.slice("/api/uploads/netlify/".length)); } catch { return new Response(null, { status: 404 }); }
  if (!netlifyKey.test(key)) return new Response(null, { status: 404 });
  try {
    const metadata = request.method === "HEAD" ? await blobs.getMetadata(key) : await blobs.getWithMetadata(key, { type: "stream" });
    if (!metadata) return new Response(null, { status: 404 });
    const type = contentTypeForExtension(key.split(".").at(-1) || "");
    if (!type) return new Response(null, { status: 404 });
    return new Response("data" in metadata ? metadata.data as ReadableStream : null, { headers: { "content-type": type, "content-length": String(metadata.metadata.size), "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
  } catch { return new Response("Storage unavailable", { status: 503, headers }); }
}
