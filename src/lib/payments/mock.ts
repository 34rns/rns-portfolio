import { createHmac, timingSafeEqual } from "node:crypto";
import {
  headerValue,
  isProductionRuntime,
  type CheckoutRequest,
  type PaymentEvent,
  type PaymentProvider,
  type WebhookHeaders,
} from "./types";

/**
 * Raised whenever anything tries to reach the mock adapter from a production
 * runtime. Selection is already refused upstream; these guards exist so no
 * later call site can reintroduce the bypass.
 */
export class MockProviderBlockedInProductionError extends Error {
  constructor() {
    super(
      "The mock payment provider cannot be used in production. " +
        "Set PAYMENT_PROVIDER to \"polar\" or \"lemonsqueezy\" with its keys.",
    );
    this.name = "MockProviderBlockedInProductionError";
  }
}

function assertMockAllowed(): void {
  if (isProductionRuntime()) throw new MockProviderBlockedInProductionError();
}

/**
 * No fallback value: a signature anyone can guess is worse than no signature.
 * The mock checkout and the webhook both refuse to run until this is set.
 */
export function mockSecret(): string {
  const secret = process.env.MOCK_PAYMENT_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "MOCK_PAYMENT_SECRET is required when PAYMENT_PROVIDER is \"mock\". " +
        "Set it to any random string in .env.local (never commit it).",
    );
  }
  return secret;
}

export function signMockPayload(rawBody: string, secret = mockSecret()): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

/**
 * The mock checkout page signs an event exactly the way a real provider would,
 * so the webhook route runs the same verification and grant path as production.
 */
export function mockEventBody({
  type,
  reference,
  orderId,
  amountCents,
  currency,
  email,
  userId,
  projectSlug,
  id,
}: {
  type: "payment.succeeded" | "payment.failed";
  reference: string;
  orderId?: string;
  amountCents: number;
  currency: string;
  email: string;
  userId: string;
  projectSlug: string;
  id?: string;
}): string {
  return JSON.stringify({
    id: id ?? `evt_mock_${reference}_${type.replace(".", "_")}`,
    type,
    data: {
      orderId: orderId ?? reference,
      reference,
      amountCents,
      currency,
      email,
      userId,
      projectSlug,
    },
  });
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function numeric(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export const mockProvider: PaymentProvider = {
  id: "mock",

  async createCheckout(request: CheckoutRequest) {
    assertMockAllowed();
    const origin = (() => {
      try {
        return new URL(request.successUrl).origin;
      } catch {
        return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
          /\/$/,
          "",
        );
      }
    })();
    return {
      id: request.reference,
      url: `${origin}/checkout/mock/${encodeURIComponent(request.reference)}`,
    };
  },

  async verifyWebhook(rawBody: string, headers: WebhookHeaders) {
    assertMockAllowed();
    const provided = headerValue(headers, "x-mock-signature");
    if (!provided) return false;
    return safeEqual(provided.trim(), signMockPayload(rawBody));
  },

  parseEvent(rawBody: string): PaymentEvent {
    const payload = JSON.parse(rawBody) as {
      id?: string;
      type?: string;
      data?: Record<string, unknown>;
    };
    const data = payload.data ?? {};
    const type =
      payload.type === "payment.succeeded"
        ? "payment.succeeded"
        : payload.type === "payment.failed"
          ? "payment.failed"
          : "ignored";

    return {
      id: text(payload.id) ?? "",
      type,
      provider: "mock",
      orderId: text(data.orderId),
      amountCents: numeric(data.amountCents),
      currency: text(data.currency),
      email: text(data.email),
      reference: text(data.reference),
      projectSlug: text(data.projectSlug),
      userId: text(data.userId),
    };
  },
};
