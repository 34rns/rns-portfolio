import { clientIp } from "@/lib/http/ip";
import { dbLicenseStore } from "@/lib/licensing/db-store";
import { checkLicenseRequest, recordLicenseFailure, recordLicenseSuccess } from "@/lib/licensing/limits";
import { parseLicenseRequest } from "@/lib/licensing/request";
import {
  badRequest,
  licenseJson,
  originRefused,
  preflight,
  readJsonBody,
  tooManyRequests,
} from "@/lib/licensing/respond";
import { activateLicense } from "@/lib/licensing/service";
import { SecretNotConfiguredError, lookupHash } from "@/lib/security/secrets";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return preflight(request);
}

export async function POST(request: Request) {
  const refused = originRefused(request);
  if (refused) return refused;

  const body = await readJsonBody(request);
  if (!body) return badRequest(request, "Send a JSON body.");

  const parsed = parseLicenseRequest(body, { requireDevice: true });
  if (!parsed.ok) return badRequest(request, parsed.error);

  const { key, projectSlug, deviceId, deviceName } = parsed.input;
  const ip = clientIp(request.headers);

  let keyHash: string;
  try {
    // Rate limiting keys on a hash, so the raw key is never held in a map.
    keyHash = lookupHash((key ?? "").toUpperCase().replace(/[\s-]/g, ""));
  } catch (error) {
    if (error instanceof SecretNotConfiguredError) {
      return NextResponse.json(
        { valid: false, plan: null, expiresAt: null, reason: "not_configured", message: error.message },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    throw error;
  }

  const limit = checkLicenseRequest({ ip, keyHash });
  if (!limit.allowed) return tooManyRequests(request, limit.retryAfterMs);

  let verdict;
  try {
    verdict = await activateLicense({
      store: dbLicenseStore,
      key: key ?? "",
      projectSlug,
      deviceId: deviceId as string,
      deviceName,
    });
  } catch (error) {
    if (error instanceof SecretNotConfiguredError) {
      return NextResponse.json(
        { valid: false, plan: null, expiresAt: null, reason: "not_configured", message: error.message },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    throw error;
  }

  if (verdict.valid) {
    recordLicenseSuccess({ ip, keyHash });
    return licenseJson(request, verdict, 200);
  }

  recordLicenseFailure({ ip, keyHash });
  // The refusal itself is always 200: activation failed, the API worked. The
  // HTTP status stays reserved for transport problems so apps can tell the
  // difference between "no" and "try again".
  return licenseJson(request, verdict, 200);
}
