import { NextResponse } from "next/server";
import { corsHeaders, isAllowedOrigin } from "@/lib/licensing/cors";
import { publicKeys, tokenTtlSeconds } from "@/lib/licensing/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The public half of the signing keys, so an app can validate a cached token
 * without another round trip. Both the current key and a previous key during a
 * rotation are listed, each with the `kid` its tokens carry.
 */
export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }

  let keys;
  try {
    keys = publicKeys();
  } catch {
    return NextResponse.json(
      { error: "The license signing keys are not configured yet." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      algorithm: "Ed25519",
      keys,
      tokenTtlSeconds: tokenTtlSeconds(),
      tokenFormat: "EdDSA/JWT — header.payload.signature, base64url, Ed25519",
      verify: "Check the signature with the key whose kid matches the token header.",
    },
    {
      status: 200,
      headers: {
        ...corsHeaders(origin),
        "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      },
    },
  );
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
