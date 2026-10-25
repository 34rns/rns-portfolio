import { lemonSqueezyProvider } from "./lemonsqueezy";
import { mockProvider } from "./mock";
import { polarProvider } from "./polar";
import {
  isProductionRuntime,
  type PaymentProvider,
  type PaymentProviderId,
} from "./types";

export * from "./types";
export {
  mockProvider,
  signMockPayload,
  mockEventBody,
  mockSecret,
  MockProviderBlockedInProductionError,
} from "./mock";
export { polarProvider } from "./polar";
export { lemonSqueezyProvider } from "./lemonsqueezy";
import { MockProviderBlockedInProductionError } from "./mock";

const providers: Record<PaymentProviderId, PaymentProvider> = {
  mock: mockProvider,
  polar: polarProvider,
  lemonsqueezy: lemonSqueezyProvider,
};

export function paymentProviderId(value = process.env.PAYMENT_PROVIDER): PaymentProviderId {
  const slug = (value ?? "mock").trim().toLowerCase() || "mock";
  if (slug !== "mock" && slug !== "polar" && slug !== "lemonsqueezy") {
    throw new Error(`Unknown PAYMENT_PROVIDER "${slug}". Use mock, polar or lemonsqueezy.`);
  }
  // The mock provider signs its own webhooks, so a production deployment that
  // defaulted to it would let anyone grant themselves access.
  if (slug === "mock" && isProductionRuntime()) {
    throw new MockProviderBlockedInProductionError();
  }
  return slug;
}

export function getPaymentProvider(value = process.env.PAYMENT_PROVIDER): PaymentProvider {
  return providers[paymentProviderId(value)];
}

/** Checkout is available from Phase 2 onwards. */
export function paymentsEnabled(): boolean {
  return true;
}
