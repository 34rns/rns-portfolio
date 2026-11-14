import { z } from "zod";

export const netlifyKey = /^(image|model)\/\d{4}-\d{2}\/[a-f0-9-]{36}\.(png|jpg|webp|gif|avif|glb|gltf)$/;
export const uploadTicketSchema = z.object({
  purpose: z.literal("netlify-upload.v1"), kid: z.string().max(100), nonce: z.uuid(),
  key: z.string().regex(netlifyKey), name: z.string().min(1).max(255),
  type: z.string().max(100), size: z.number().int().min(1).max(40 * 1024 ** 2),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  iat: z.number().int(), exp: z.number().int(),
}).strict();
export type UploadTicket = z.infer<typeof uploadTicketSchema>;
export type UploadPublicKey = JsonWebKey & { kid: string };

export async function verifyUploadTicket(token: string, keys: UploadPublicKey[], now = Date.now()): Promise<UploadTicket> {
  if (token.length > 3000) throw new Error("Invalid upload ticket.");
  const parts = token.split(".");
  if (parts.length !== 2 || parts.some(p => !/^[A-Za-z0-9_-]+$/.test(p))) throw new Error("Invalid upload ticket.");
  const decode = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const claims = uploadTicketSchema.parse(JSON.parse(new TextDecoder().decode(decode(parts[0]))));
  const key = keys.find(k => k.kid === claims.kid);
  const seconds = Math.floor(now / 1000);
  if (!key || claims.exp <= seconds || claims.iat > seconds + 30 || claims.exp <= claims.iat || claims.exp - claims.iat > 900) throw new Error("Upload ticket expired or invalid.");
  if (claims.key.startsWith("image/") && claims.size > 8 * 1024 ** 2) throw new Error("Image too large.");
  const publicKey = await crypto.subtle.importKey("jwk", key, "Ed25519", false, ["verify"]);
  if (!await crypto.subtle.verify("Ed25519", publicKey, decode(parts[1]), new TextEncoder().encode(parts[0]))) throw new Error("Invalid upload signature.");
  return claims;
}
