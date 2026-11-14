import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { generateKeyPairSync, createHash } from "node:crypto";

const state = vi.hoisted(() => ({ denied: null as Response | null, failPendingDelete: false, entries: new Map<string, { bytes: Uint8Array<ArrayBuffer>; metadata: Record<string, unknown> }>() }));
vi.mock("@/lib/auth/portfolio-http", () => ({ portfolioRequestDenied: async () => state.denied }));
vi.mock("@netlify/blobs", () => ({ getStore: () => ({
  async set(key: string, body: Blob, options: { onlyIfNew?: boolean; metadata: Record<string, unknown> }) {
    if (options.onlyIfNew && state.entries.has(key)) return { modified: false };
    state.entries.set(key, { bytes: new Uint8Array(await body.arrayBuffer()), metadata: options.metadata }); return { modified: true };
  },
  async delete(key: string) { if (state.failPendingDelete && key.startsWith("pending/")) throw new Error("Cleanup unavailable"); state.entries.delete(key); },
  async getMetadata(key: string) { const record = state.entries.get(key); return record ? { metadata: record.metadata } : null; },
  async getWithMetadata(key: string, options: { type: string }) {
    const record = state.entries.get(key); if (!record) return null;
    const data = options.type === "stream" ? new ReadableStream({ start(controller) { controller.enqueue(record.bytes); controller.close(); } }) : record.bytes.buffer;
    return { data, metadata: record.metadata };
  },
  async list() { return { blobs: [...state.entries.keys()].map(key => ({ key })) }; },
}) }));

import { POST } from "@/app/api/admin/upload/netlify/route";
import uploads from "../netlify/edge-functions/uploads";
import { publicJwks } from "@/lib/licensing/v1-token";
import { cleanupNetlifyPending } from "@/lib/uploads/netlify-storage";
import { NETLIFY_UPLOAD_CHUNK_BYTES } from "@/lib/uploads/policy";
const origin = "https://moved.example.test";
beforeEach(() => {
  state.entries.clear(); state.denied = null; state.failPendingDelete = false;
  const pair = generateKeyPairSync("ed25519");
  vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY", pair.privateKey.export({ type: "pkcs8", format: "der" }).toString("base64"));
  vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS", ""); vi.stubEnv("NEXT_PUBLIC_SITE_URL", origin); vi.stubEnv("STORAGE_PROVIDER", "netlify");
  vi.stubGlobal("Netlify", { env: { get: (key: string) => key === "NETLIFY_UPLOAD_PUBLIC_KEYS" ? JSON.stringify(publicJwks()) : origin } });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const post = (body: object) => POST(new Request(`${origin}/api/admin/upload/netlify`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) }));
async function issue(bytes: Uint8Array<ArrayBuffer>, name = "cover.png", type = "image/png") {
  const response = await post({ name, type, size: bytes.length, head: Buffer.from(bytes.slice(0, 96)).toString("base64"), sha256: createHash("sha256").update(bytes).digest("hex") });
  expect(response.status).toBe(200); return response.json() as Promise<{ ticket: string; uploadUrl: string }>;
}
const putPart = (issued: { ticket: string; uploadUrl: string }, bytes: Uint8Array<ArrayBuffer>, part = 0) => uploads(new Request(origin + issued.uploadUrl, { method: "PUT", headers: { origin, authorization: `Bearer ${issued.ticket}`, "x-upload-part": String(part) }, body: bytes }));
async function put(issued: { ticket: string; uploadUrl: string }, bytes: Uint8Array<ArrayBuffer>) {
  let result: Response | undefined;
  for (let offset = 0; offset < bytes.length; offset += NETLIFY_UPLOAD_CHUNK_BYTES) {
    result = await putPart(issued, bytes.slice(offset, offset + NETLIFY_UPLOAD_CHUNK_BYTES), offset / NETLIFY_UPLOAD_CHUNK_BYTES);
    if (!result.ok) return result;
  }
  return result!;
}
const png = () => Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,0]);

it("requires owner permission before issuing a ticket", async () => {
  state.denied = Response.json({}, { status: 403 }); expect((await post({})).status).toBe(403); expect(state.entries.size).toBe(0);
});
it("accepts the configured Netlify storage alias", async () => {
  vi.stubEnv("STORAGE_PROVIDER", " Netlify-Blobs "); await issue(png());
});
it("keeps pending files private, rejects replay, validates bytes and publishes once", async () => {
  const bytes = png(), ticket = await issue(bytes);
  expect((await put(ticket, bytes)).status).toBe(201); expect((await put(ticket, bytes)).status).toBe(409);
  const pending = [...state.entries.keys()][0]; expect((await uploads(new Request(`${origin}/api/uploads/netlify/${pending}`))).status).toBe(404);
  const response = await post({ ticket: ticket.ticket }); expect(response.status).toBe(201); const stored = await response.json();
  expect(state.entries.has(pending)).toBe(false); expect((await post({ ticket: ticket.ticket })).status).toBe(200);
  expect(stored.url).toMatch(/^https:\/\/moved.example.test\//);
  const read = await uploads(new Request(stored.url)); expect(read.headers.get("content-type")).toBe("image/png"); expect(new Uint8Array(await read.arrayBuffer())).toEqual(bytes);
});
it("preserves the full 40 MiB model limit through edge upload and streamed reading", async () => {
  const bytes = new Uint8Array(40 * 1024 ** 2); bytes.set(new TextEncoder().encode("glTF"));
  const view = new DataView(bytes.buffer); view.setUint32(4, 2, true); view.setUint32(8, bytes.length, true);
  const ticket = await issue(bytes, "model.glb", "model/gltf-binary"); expect((await put(ticket, bytes)).status).toBe(201);
  const result = await post({ ticket: ticket.ticket }); expect(result.status).toBe(201); const stored = await result.json();
  const read = await uploads(new Request(stored.url)); expect(read.headers.get("content-length")).toBe(String(bytes.length));
  const actual = new Uint8Array(await read.arrayBuffer()); expect(actual.length).toBe(bytes.length); expect(actual.slice(0, 4)).toEqual(bytes.slice(0, 4));
});
it("refuses tampered tickets, expired tickets, wrong origins and oversized bodies", async () => {
  const bytes = png(), ticket = await issue(bytes);
  const [payload, signature] = ticket.ticket.split("."); const forged = { ...ticket, ticket: `${payload}.${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}` };
  expect((await put(forged, bytes)).status).toBe(401);
  expect((await put(ticket, new Uint8Array(bytes.length + 1))).status).toBe(413);
  expect((await uploads(new Request(origin + ticket.uploadUrl, { method: "PUT", headers: { origin: "https://evil.example.test", authorization: `Bearer ${ticket.ticket}` }, body: bytes }))).status).toBe(403);
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 901000); expect((await put(ticket, bytes)).status).toBe(401); vi.restoreAllMocks();
  expect(state.entries.size).toBe(0);
});
it("rejects invalid content on finalize and cleans up expired pending uploads", async () => {
  const bytes = png(), ticket = await issue(bytes); expect((await put(ticket, new Uint8Array(bytes.length))).status).toBe(201);
  expect((await post({ ticket: ticket.ticket })).status).toBe(400); expect(state.entries.size).toBe(0);
  state.entries.set("pending/old", { bytes, metadata: { expiresAt: 1 } });
  state.entries.set("pending/current", { bytes, metadata: { expiresAt: Math.floor(Date.now()/1000) + 600 } });
  expect(await cleanupNetlifyPending()).toBe(1); expect(state.entries.has("pending/current")).toBe(true);
});
it("recovers the published URL after cleanup failure without creating another file", async () => {
  const bytes = png(), ticket = await issue(bytes); expect((await put(ticket, bytes)).status).toBe(201);
  state.failPendingDelete = true;
  const response = await post({ ticket: ticket.ticket }); expect(response.status).toBe(201); const first = await response.json();
  const retry = await post({ ticket: ticket.ticket }); expect(retry.status).toBe(200); expect((await retry.json()).url).toBe(first.url);
  expect([...state.entries.keys()].filter(key => !key.startsWith("pending/")).length).toBe(1);
});
it("refuses a valid-looking upload whose bytes differ from the signed file hash", async () => {
  const bytes = png(), ticket = await issue(bytes), changed = bytes.slice(); changed[11] = 1;
  expect((await put(ticket, changed)).status).toBe(201); expect((await post({ ticket: ticket.ticket })).status).toBe(400); expect(state.entries.size).toBe(0);
});
