export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export type RateLimiter = {
  check(key: string): RateLimitResult;
  reset(): void;
};

/**
 * Fixed-window limiter held in memory. Serverless instances each keep their own
 * map, so this blunts bursts and credential stuffing rather than guaranteeing a
 * global cap; a shared store can replace it without touching call sites.
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
}): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key) {
      const time = now();
      const entry = hits.get(key);

      if (!entry || entry.resetAt <= time) {
        hits.set(key, { count: 1, resetAt: time + windowMs });
        return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
      }

      if (entry.count >= limit) {
        return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - time };
      }

      entry.count += 1;
      return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 };
    },
    reset() {
      hits.clear();
    },
  };
}

export const authRateLimit: RateLimiter = createRateLimiter({
  limit: 10,
  windowMs: 10 * 60 * 1000,
});
