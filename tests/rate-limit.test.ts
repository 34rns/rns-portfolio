import { describe, expect, it } from "vitest";
import { authCallbackKey, createRateLimiter } from "@/lib/auth/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit and then refuses", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => 0 });

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
    const blocked = limiter.check("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(1000);
  });

  it("resets after the window", () => {
    let time = 0;
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => time });

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    time = 1000;
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("limits credential callbacks and ignores other routes", () => {
    expect(authCallbackKey("/api/auth/callback/visitor", "1.2.3.4")).toBe(
      "auth-callback:1.2.3.4",
    );
    expect(authCallbackKey("/api/auth/callback/admin", "::1")).toBe("auth-callback:::1");
    expect(authCallbackKey("/api/auth/session", "1.2.3.4")).toBeNull();
    expect(authCallbackKey("/account/login", "1.2.3.4")).toBeNull();
  });

  it("tracks keys separately", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => 0 });

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });
});
