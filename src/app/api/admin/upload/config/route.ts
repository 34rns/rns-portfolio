import { portfolioRequestDenied } from "@/lib/auth/portfolio-http";
import { resolveStorageDriver } from "@/lib/uploads/storage";
export async function GET() {
  const denied = await portfolioRequestDenied(); if (denied) return denied;
  return Response.json({ driver: resolveStorageDriver() }, { headers: { "cache-control": "no-store" } });
}
