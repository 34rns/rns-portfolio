export type PaymentProviderId = "mock" | "polar" | "lemonsqueezy";

/**
 * `next build`/`next start` and every Vercel deployment (preview included) run
 * with NODE_ENV=production; `next dev` and the test runner do not.
 */
export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export type WebhookHeaders = Headers | Record<string, string | null | undefined>;

export type CheckoutRequest = {
  /** Our own id; travels in metadata so the webhook can find the row. */
  reference: string;
  productId: string;
  email: string;
  userId: string;
  projectSlug: string;
  amountCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSession = {
  id: string;
  url: string;
};

export type PaymentEventType =
  | "payment.succeeded"
  | "payment.failed"
  | "payment.refunded"
  | "ignored";

/** Provider payloads are normalised into this before any business logic runs. */
export type PaymentEvent = {
  id: string;
  type: PaymentEventType;
  provider: PaymentProviderId;
  orderId: string | null;
  amountCents: number | null;
  currency: string | null;
  email: string | null;
  reference: string | null;
  projectSlug: string | null;
  userId: string | null;
};

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  verifyWebhook(rawBody: string, headers: WebhookHeaders): Promise<boolean>;
  parseEvent(rawBody: string): PaymentEvent;
  getCustomerPortal?(customerId: string): Promise<{ url: string }>;
}

export function headerValue(headers: WebhookHeaders, name: string): string | null {
  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(name);
  }
  const record = headers as Record<string, string | null | undefined>;
  const key = Object.keys(record).find((candidate) => candidate.toLowerCase() === name);
  const value = key ? record[key] : undefined;
  return value ?? null;
}
