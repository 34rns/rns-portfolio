import { randomUUID, sign, createHash } from "node:crypto";
import { z } from "zod";
import { portfolioRequestDenied } from "@/lib/auth/portfolio-http";
import { signingKeys } from "@/lib/licensing/token";
import { publicJwks } from "@/lib/licensing/v1-token";
import { readBoundedJson } from "@/lib/licensing/http";
import { siteUrl } from "@/lib/seo";
import { validateUpload, validateUploadToken, contentTypeForExtension, NETLIFY_UPLOAD_CHUNK_BYTES } from "@/lib/uploads/policy";
import { netlifyUploads, createNetlifyStorage } from "@/lib/uploads/netlify-storage";
import { resolveStorageDriver } from "@/lib/uploads/storage";
import { verifyUploadTicket, uploadTicketSchema, type UploadPublicKey } from "@/lib/uploads/netlify-ticket";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await portfolioRequestDenied(); if (denied) return denied;
  if (request.headers.get("origin") !== new URL(siteUrl()).origin) return Response.json({ error: "Origin denied." }, { status: 403 });
  if (resolveStorageDriver() !== "netlify-blobs") return Response.json({ error: "Netlify storage is not configured." }, { status: 503 });
  try {
    const input = await readBoundedJson(request, 4000);
    const finalize = z.object({ ticket: z.string().max(3000) }).strict().safeParse(input);
    if (finalize.success) {
      const ticket = await verifyUploadTicket(finalize.data.ticket, publicJwks().keys as UploadPublicKey[]);
      const blobs = netlifyUploads();
      const storedResult = (contentType: string) => ({ driver: "netlify-blobs", key: ticket.key, url: new URL(`/api/uploads/netlify/${ticket.key}`, siteUrl()).href, size: ticket.size, contentType });
      const existing = await blobs.getMetadata(ticket.key);
      if (existing && existing.metadata.size === ticket.size && existing.metadata.contentType === contentTypeForExtension(ticket.key.split(".").at(-1) || "")) return Response.json(storedResult(String(existing.metadata.contentType)));
      const pendingKeys = Array.from({ length: Math.ceil(ticket.size / NETLIFY_UPLOAD_CHUNK_BYTES) }, (_, i) => `pending/${ticket.nonce}/${i}`);
      const parts: ArrayBuffer[] = [];
      for (let i = 0; i < pendingKeys.length; i += 8) {
        const group = await Promise.all(pendingKeys.slice(i, i + 8).map(key => blobs.getWithMetadata(key, { type: "arrayBuffer" })));
        if (group.some(part => !part)) return Response.json({ error: "Upload incomplete. Try again." }, { status: 409 });
        parts.push(...group.map(part => part!.data));
      }
      const bytes = new Uint8Array(Buffer.concat(parts.map(part => Buffer.from(part))));
      const checked = validateUpload({ name: ticket.name, type: ticket.type, bytes });
      if (!checked.ok || bytes.length !== ticket.size || createHash("sha256").update(bytes).digest("hex") !== ticket.sha256) {
        await Promise.allSettled(pendingKeys.map(key => blobs.delete(key)));
        return Response.json({ error: checked.ok ? "Upload contents do not match the selected file. Try again." : checked.error }, { status: 400 });
      }
      const stored = await createNetlifyStorage(blobs).put({ key: ticket.key, data: bytes, contentType: checked.upload.contentType });
      await Promise.allSettled(pendingKeys.map(key => blobs.delete(key)));
      return Response.json(stored, { status: 201 });
    }
    const metadata = z.object({ name: z.string().max(255), type: z.string().max(100), size: z.number().int(), head: z.string().max(200), sha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict().parse(input);
    const checked = validateUploadToken({ ...metadata, head: Buffer.from(metadata.head, "base64") });
    if (!checked.ok) return Response.json({ error: checked.error }, { status: 400 });
    const [key] = signingKeys(); if (!key) throw new Error("Signing key unavailable.");
    const iat = Math.floor(Date.now() / 1000);
    const claims = uploadTicketSchema.parse({ purpose: "netlify-upload.v1", kid: key.kid, nonce: randomUUID(), key: checked.upload.key, name: metadata.name, type: metadata.type, size: metadata.size, sha256: metadata.sha256, iat, exp: iat + 900 });
    const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const signature = sign(null, Buffer.from(payload), key.privateKey).toString("base64url");
    return Response.json({ ticket: `${payload}.${signature}`, uploadUrl: "/api/admin/upload/netlify-body" }, { headers: { "cache-control": "no-store" } });
  } catch { return Response.json({ error: "Upload could not be verified or stored. Try again." }, { status: 400 }); }
}
