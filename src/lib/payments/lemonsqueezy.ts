import { createHmac, timingSafeEqual } from "node:crypto";
import {
  headerValue,
  type CheckoutRequest,
  type PaymentEvent,
  type PaymentProvider,
  type WebhookHeaders,
} from "./types";

const API_BASE = "https://api.lemonsqueezy.com";

function apiKey(): string {
  const value = process.env.LEMONSQUEEZY_API_KEY;
  if (!value) {
    throw new Error(
      "LEMONSQUEEZY_API_KEY is not set. Add it to .env.local to use Lemon Squeezy.",
    );
  }
  return value;
}

function storeId(): string {
  const value = process.env.LEMONSQUEEZY_STORE_ID;
  if (!value) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not set. Add it to .env.local.");
  }
  return value;
}

function webhookSecret(): string {
  const value = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!value) {
    throw new Error(
      "LEMONSQUEEZY_WEBHOOK_SECRET is not set. Add it to .env.local to verify webhooks.",
    );
  }
  return value;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numeric(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

export const lemonSqueezyProvider: PaymentProvider = {
  id: "lemonsqueezy",

  async createCheckout(request: CheckoutRequest) {
    const response = await fetch(`${API_BASE}/v1/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            product_options: {
              redirect_url: request.successUrl,
            },
            checkout_data: {
              email: request.email,
              custom: {
                reference: request.reference,
                user_id: request.userId,
                project_slug: request.projectSlug,
              },
            },
          },
          relationships: {
            store: { data: { type: "stores", id: storeId() } },
            variant: { data: { type: "variants", id: request.productId } },
          },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Lemon Squeezy checkout failed (${response.status}): ${detail.slice(0, 300)}`,
      );
    }

    const payload = (await response.json()) as {
      data?: { id?: string; attributes?: { url?: string } };
    };
    const url = payload.data?.attributes?.url;
    if (!url) throw new Error("Lemon Squeezy returned a checkout without a URL.");

    return { id: payload.data?.id ?? request.reference, url };
  },

  async verifyWebhook(rawBody: string, headers: WebhookHeaders) {
    const provided = headerValue(headers, "x-signature");
    if (!provided) return false;

    const expected = createHmac("sha256", webhookSecret()).update(rawBody).digest("hex");
    const left = Buffer.from(provided.trim().toLowerCase());
    const right = Buffer.from(expected);
    return left.length === right.length && timingSafeEqual(left, right);
  },

  parseEvent(rawBody: string): PaymentEvent {
    const payload = JSON.parse(rawBody) as {
      meta?: {
        event_name?: string;
        custom_data?: Record<string, unknown>;
      };
      data?: {
        id?: string;
        attributes?: {
          total?: number;
          currency?: string;
          user_email?: string;
          status?: string;
        };
      };
    };
    const eventName = payload.meta?.event_name ?? "";
    const custom = payload.meta?.custom_data ?? {};
    const attributes = payload.data?.attributes ?? {};

    const type =
      eventName === "order_created"
        ? "payment.succeeded"
        : eventName === "order_refunded"
          ? "payment.refunded"
          : eventName === "order_payment_failed"
            ? "payment.failed"
            : "ignored";

    return {
      id: text(payload.data?.id) ? `${eventName}:${payload.data?.id}` : "",
      type,
      provider: "lemonsqueezy",
      orderId: text(payload.data?.id),
      amountCents: numeric(attributes.total),
      currency: text(attributes.currency),
      email: text(attributes.user_email),
      reference: text(custom.reference),
      projectSlug: text(custom.project_slug),
      userId: text(custom.user_id),
    };
  },
};
