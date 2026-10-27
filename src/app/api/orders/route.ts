import { NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/auth/rate-limit";
import { clientIp } from "@/lib/http/ip";
import { dbOrderStore } from "@/lib/orders/db-store";
import {
  checkSubmissionGuards,
  orderRequestSchema,
  requestProOrder,
} from "@/lib/orders/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Requests are cheap to submit and expensive to answer, so the brake sits in
 * front of the database rather than after it.
 */
const requests = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const limit = requests.check(`order:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests from this address. Try again later." },
      {
        status: 429,
        headers: { "retry-after": String(Math.ceil(limit.retryAfterMs / 1000)) },
      },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const guard = checkSubmissionGuards({
    website: typeof body.website === "string" ? body.website : null,
    renderedAt: typeof body.renderedAt === "number" ? body.renderedAt : Number(body.renderedAt),
  });
  if (!guard.ok) {
    return NextResponse.json(
      { error: "We could not verify that submission. Please reload the page and try again." },
      { status: 400 },
    );
  }

  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Check the form and try again." },
      { status: 400 },
    );
  }

  const result = await requestProOrder({ store: dbOrderStore, input: parsed.data });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    { token: result.token },
    { status: 201, headers: { "cache-control": "no-store" } },
  );
}
