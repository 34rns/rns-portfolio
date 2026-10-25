import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPaymentProvider,
  MockProviderBlockedInProductionError,
  paymentProviderId,
} from "@/lib/payments";
import {
  mockProvider,
  mockSecret,
  signMockPayload,
} from "@/lib/payments/mock";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("mock provider cannot run in production", () => {
  it("refuses selection when PAYMENT_PROVIDER is unset in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYMENT_PROVIDER", "");

    expect(() => paymentProviderId()).toThrow(MockProviderBlockedInProductionError);
    expect(() => getPaymentProvider()).toThrow(MockProviderBlockedInProductionError);
  });

  it("refuses selection when PAYMENT_PROVIDER is explicitly mock", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() => paymentProviderId("mock")).toThrow(MockProviderBlockedInProductionError);
    expect(() => getPaymentProvider("mock")).toThrow(MockProviderBlockedInProductionError);
  });

  it("still accepts a real provider in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(paymentProviderId("polar")).toBe("polar");
    expect(paymentProviderId("lemonsqueezy")).toBe("lemonsqueezy");
    // An unset PAYMENT_PROVIDER defaults to mock, so it is refused too.
    expect(() => paymentProviderId("")).toThrow(MockProviderBlockedInProductionError);
  });

  it("blocks the adapter itself, not just the selector", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(
      mockProvider.createCheckout({
        reference: "chk_1",
        productId: "prod_1",
        email: "buyer@example.com",
        userId: "user_1",
        projectSlug: "p",
        amountCents: 100,
        currency: "USD",
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      }),
    ).rejects.toThrow(MockProviderBlockedInProductionError);

    await expect(mockProvider.verifyWebhook("{}", {})).rejects.toThrow(
      MockProviderBlockedInProductionError,
    );
  });

  it("allows the adapter outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(paymentProviderId("mock")).toBe("mock");
    expect(() => mockSecret()).not.toThrow();
  });
});

describe("MOCK_PAYMENT_SECRET is required, never defaulted", () => {
  it("throws when unset instead of falling back", () => {
    vi.stubEnv("MOCK_PAYMENT_SECRET", "");
    expect(() => mockSecret()).toThrow(/MOCK_PAYMENT_SECRET is required/);
    expect(() => signMockPayload("{}")).toThrow(/MOCK_PAYMENT_SECRET is required/);
  });

  it("throws when only whitespace", () => {
    vi.stubEnv("MOCK_PAYMENT_SECRET", "   ");
    expect(() => mockSecret()).toThrow(/MOCK_PAYMENT_SECRET is required/);
  });

  it("signs with the configured secret", () => {
    vi.stubEnv("MOCK_PAYMENT_SECRET", "not-the-default");
    expect(mockSecret()).toBe("not-the-default");
    expect(signMockPayload("{}")).toHaveLength(64);
  });
});
