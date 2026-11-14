import { describe, expect, it, vi } from "vitest";
import { assertTestDatabase } from "../scripts/licensing/check-test-env";
import { getLicenseStore } from "@/lib/licensing/transaction-store";

describe("isolated licensing database", () => {
  it("uses the main database when the optional licensing URL is blank", () => {
    vi.stubEnv("DATABASE_URL", "postgres://test:test@127.0.0.1:55432/licensing_test");
    vi.stubEnv("LICENSE_DATABASE_URL", "");
    try { expect(() => getLicenseStore()).not.toThrow(); } finally { vi.unstubAllEnvs(); }
  });
  it("refuses missing, production and unmarked targets", () => {
    expect(() => assertTestDatabase("", "live.neon.tech")).toThrow();
    expect(() => assertTestDatabase("postgres://test:test@live.neon.tech/app_test", "live.neon.tech")).toThrow();
    expect(() => assertTestDatabase("postgres://test:test@localhost/portfolio", "live.neon.tech")).toThrow();
    expect(() => assertTestDatabase("postgres://test:test@other.neon.tech/app_test", "live.neon.tech")).toThrow();
  });
  it("allows only explicit local test/demo databases", () => {
    expect(() => assertTestDatabase("postgres://test:test@127.0.0.1:55432/licensing_test", "live.neon.tech")).not.toThrow();
    expect(() => assertTestDatabase("postgres://test:test@localhost:55432/licensing_demo", "live.neon.tech")).not.toThrow();
  });
});
