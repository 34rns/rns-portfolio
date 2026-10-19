import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { dbStore } from "@/lib/payments/db-store";
import { handlePaymentWebhook } from "@/lib/payments/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: slug } = await context.params;

  let provider;
  try {
    provider = getPaymentProvider(slug);
  } catch {
    return NextResponse.json({ error: "Unknown provider." }, { status: 404 });
  }

  const rawBody = await request.text();
  const result = await handlePaymentWebhook({
    provider,
    store: dbStore,
    rawBody,
    headers: request.headers,
  });

  return NextResponse.json(
    result.status === 200 ? { received: true, ...result } : { error: result.reason },
    { status: result.status, headers: { "cache-control": "no-store" } },
  );
}
