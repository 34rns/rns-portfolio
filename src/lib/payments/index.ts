/**
 * Provider-agnostic payments seam. Phase 2 implements one adapter (Polar or
 * Lemon Squeezy) behind this interface; checkout UI stays hidden until then.
 */
export type CheckoutRequest = {
  projectSlug: string;
  providerProductId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSession = {
  id: string;
  url: string;
};

export interface PaymentProvider {
  readonly id: string;
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  verifyWebhook(rawBody: string, signature: string | null): Promise<boolean>;
}

export function paymentsEnabled(): boolean {
  return false;
}
