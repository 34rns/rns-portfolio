import { NextResponse } from "next/server";
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
import { verifyLicense } from "@/lib/licensing/service";
import { SecretNotConfiguredError, lookupHash } from "@/lib/security/secrets";

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

  const parsed = parseLicenseRequest(body, { requireDevice: false });
  if (!parsed.ok) return badRequest(request, parsed.error);

  const { key, token, projectSlug, deviceId } = parsed.input;
  const ip = clientIp(request.headers);

  let keyHash: string;
  try {
    keyHash = token
      ? lookupHash(token.slice(0, 512))
      : lookupHash((key ?? "").toUpperCase().replace(/[\s-]/g, ""));
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
    verdict = await verifyLicense({
      store: dbLicenseStore,
      key: token ? null : key,
      token,
      projectSlug,
      deviceId,
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
  } else {
    recordLicenseFailure({ ip, keyHash });
  }

  return licenseJson(request, verdict, 200);
}
