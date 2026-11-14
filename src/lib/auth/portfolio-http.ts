import { NextResponse } from "next/server";
import { requireCapability } from "./principal";
import { LicenseDomainError } from "../licensing/contracts";

/** Recheck the current owner permission, including revoked staff sessions. */
export async function portfolioRequestDenied(): Promise<NextResponse | null> {
  try {
    await requireCapability("portfolio.write");
    return null;
  } catch (error) {
    const status = error instanceof LicenseDomainError ? error.status : 503;
    return NextResponse.json({ error: status === 401 ? "Sign in to continue." : status === 403 ? "Owners only." : "Permissions could not be verified. Try again." }, { status });
  }
}
