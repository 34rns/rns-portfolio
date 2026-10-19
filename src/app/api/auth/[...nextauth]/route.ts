import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { authCallbackKey, authRateLimit } from "@/lib/auth/rate-limit";

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = authCallbackKey(new URL(request.url).pathname, ip);

  if (key && !authRateLimit.check(key).allowed) {
    return Response.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429, headers: { "cache-control": "no-store" } },
    );
  }

  return handlers.POST(request);
}
