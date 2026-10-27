import { NextResponse } from "next/server";
import { corsHeaders, isAllowedOrigin } from "./cors";
import type { DenyReason, LicenseVerdict } from "./service";

/**
 * Plain-language, and deliberately vague about keys that do not work: a
 * refusal must not tell an attacker whether the key exists at all. Only a key
 * that was successfully verified can be told why it stopped working.
 */
const MESSAGES: Record<DenyReason, string> = {
  invalid_key: "That key could not be verified.",
  invalid_token: "That token could not be verified.",
  token_expired: "The cached token has expired. Verify with your key again.",
  revoked: "That key is no longer active.",
  expired: "That key has expired.",
  device_limit: "This key has reached its device limit.",
  not_activated: "Activate this device first.",
  wrong_project: "That key could not be verified.",
};

/** Shape returned to an app. `reason` is for the app's own UI, never a key id. */
export function licenseJson(
  request: Request,
  verdict: LicenseVerdict,
  status: number,
): NextResponse {
  const origin = request.headers.get("origin");

  return NextResponse.json(
    {
      valid: verdict.valid,
      plan: verdict.plan,
      expiresAt: verdict.expiresAt,
      ...(verdict.reason ? { reason: verdict.reason, message: MESSAGES[verdict.reason] } : {}),
      ...(verdict.token
        ? {
            token: verdict.token,
            tokenExpiresAt: verdict.tokenExpiresAt,
            graceUntil: verdict.graceUntil,
          }
        : {}),
    },
    { status, headers: { ...corsHeaders(origin), "cache-control": "no-store" } },
  );
}

export function originRefused(request: Request): NextResponse | null {
  if (isAllowedOrigin(request.headers.get("origin"))) return null;
  return NextResponse.json(
    { valid: false, plan: null, expiresAt: null, reason: "invalid_request", message: "Origin not allowed." },
    { status: 403, headers: { "cache-control": "no-store" } },
  );
}

export function preflight(request: Request): NextResponse {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export function badRequest(request: Request, message: string): NextResponse {
  return NextResponse.json(
    { valid: false, plan: null, expiresAt: null, reason: "invalid_request", message },
    { status: 400, headers: { ...corsHeaders(request.headers.get("origin")), "cache-control": "no-store" } },
  );
}

export function tooManyRequests(request: Request, retryAfterMs: number): NextResponse {
  return NextResponse.json(
    {
      valid: false,
      plan: null,
      expiresAt: null,
      reason: "rate_limited",
      message: "Too many attempts. Try again shortly.",
    },
    {
      status: 429,
      headers: {
        ...corsHeaders(request.headers.get("origin")),
        "cache-control": "no-store",
        "retry-after": String(Math.max(1, Math.ceil(retryAfterMs / 1000))),
      },
    },
  );
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
