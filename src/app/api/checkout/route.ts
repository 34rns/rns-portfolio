import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payments";
import { startCheckout } from "@/lib/payments/checkout";
import { dbStore } from "@/lib/payments/db-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Sign in to buy this project." }, { status: 401 });
  }
  if (session.user.role !== "customer") {
    return NextResponse.json(
      { error: "Use a visitor account to buy. Admin accounts cannot purchase." },
      { status: 403 },
    );
  }

  let slug = "";
  try {
    const body = (await request.json()) as { slug?: unknown };
    slug = typeof body.slug === "string" ? body.slug.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json({ error: "Missing project." }, { status: 400 });
  }

  let provider;
  try {
    provider = getPaymentProvider();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payments are misconfigured.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const result = await startCheckout({
    store: dbStore,
    provider,
    user: { id: session.user.id, email: session.user.email },
    slug,
    origin: new URL(request.url).origin,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    { url: result.url, reference: result.reference },
    { headers: { "cache-control": "no-store" } },
  );
}
