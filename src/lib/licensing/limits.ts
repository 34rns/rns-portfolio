import { createRateLimiter } from "@/lib/auth/rate-limit";

/**
 * Two caps and a lockout.
 *
 * `perIp` blunts a burst from one address, `perKey` blunts one bad key tried
 * from many addresses, and `failures` escalates to a lockout: ten rejected
 * attempts on the same address or the same key and that identifier is refused
 * outright for a quarter of an hour, whether or not it would pass the cap.
 */
const perIp = createRateLimiter({ limit: 60, windowMs: 60_000 });
const perKey = createRateLimiter({ limit: 30, windowMs: 60_000 });
const failures = createRateLimiter({ limit: 10, windowMs: 10 * 60_000 });

const LOCKOUT_MS = 15 * 60 * 1000;
const locked = new Map<string, number>();

export type LimitVerdict =
  | { allowed: true }
  | { allowed: false; reason: "rate_limit" | "lockout"; retryAfterMs: number };

function lockedFor(id: string, now: number): number {
  const until = locked.get(id);
  if (!until) return 0;
  if (until <= now) {
    locked.delete(id);
    return 0;
  }
  return until - now;
}

export function checkLicenseRequest({
  ip,
  keyHash,
  now = Date.now(),
}: {
  ip: string;
  keyHash: string;
  now?: number;
}): LimitVerdict {
  const lockout = Math.max(lockedFor(`ip:${ip}`, now), lockedFor(`key:${keyHash}`, now));
  if (lockout > 0) return { allowed: false, reason: "lockout", retryAfterMs: lockout };

  const byIp = perIp.check(`ip:${ip}`);
  if (!byIp.allowed) {
    return { allowed: false, reason: "rate_limit", retryAfterMs: byIp.retryAfterMs };
  }

  const byKey = perKey.check(`key:${keyHash}`);
  if (!byKey.allowed) {
    return { allowed: false, reason: "rate_limit", retryAfterMs: byKey.retryAfterMs };
  }

  return { allowed: true };
}

export function recordLicenseFailure({
  ip,
  keyHash,
  now = Date.now(),
}: {
  ip: string;
  keyHash: string;
  now?: number;
}): { lockedOut: boolean } {
  const byIp = failures.check(`ip:${ip}`);
  const byKey = failures.check(`key:${keyHash}`);

  // `remaining === 0` is the tenth failure: the counter allows the request that
  // exhausts the budget, so the lockout starts on the one that fills it.
  let lockedOut = false;
  if (!byIp.allowed || byIp.remaining === 0) {
    locked.set(`ip:${ip}`, now + LOCKOUT_MS);
    lockedOut = true;
  }
  if (!byKey.allowed || byKey.remaining === 0) {
    locked.set(`key:${keyHash}`, now + LOCKOUT_MS);
    lockedOut = true;
  }

  return { lockedOut };
}

/** A good key clears its own counters; other identifiers are unaffected. */
export function recordLicenseSuccess({ ip, keyHash }: { ip: string; keyHash: string }): void {
  perKey.clear(`key:${keyHash}`);
  failures.clear(`key:${keyHash}`);
  failures.clear(`ip:${ip}`);
  locked.delete(`key:${keyHash}`);
}

/** Tests only: module state outlives a single case. */
export function resetLicenseLimits(): void {
  perIp.reset();
  perKey.reset();
  failures.reset();
  locked.clear();
}
