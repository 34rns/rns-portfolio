import { createHmac, timingSafeEqual } from "node:crypto";
import {
  headerValue,
  type CheckoutRequest,
  type PaymentEvent,
  type PaymentProvider,
  type WebhookHeaders,
} from "./types";

const API_BASE = "https://api.polar.sh";
const SANDBOX_BASE = "https://sandbox-api.polar.sh";
const TOLERANCE_SECONDS = 5 * 60;

function token(): string {
  const value = process.env.POLAR_ACCESS_TOKEN;
  if (!value) {
    throw new Error("POLAR_ACCESS_TOKEN is not set. Add it to .env.local to use Polar.");
  }
  return value;
}

function baseUrl(): string {
  return process.env.POLAR_SERVER === "sandbox" ? SANDBOX_BASE : API_BASE;
}

function webhookSecret(): string {
  const value = process.env.POLAR_WEBHOOK_SECRET;
  if (!value) {
    throw new Error("POLAR_WEBHOOK_SECRET is not set. Add it to .env.local to verify webhooks.");
  }
  return value;
}

/**
 * Polar issues Standard Webhooks secrets (`whsec_…`, older `polar_whs_…`).
 * The key is the base64 body of the secret; older secrets were used verbatim,
 * so both forms are accepted.
 */
function keyCandidates(secret: string): Buffer[] {
  const raw = secret.trim();
  const stripped = raw.replace(/^(whsec_|polar_whs_)/, "");
  const candidates: Buffer[] = [];

  if (stripped) {
    const decoded = Buffer.from(stripped, "base64");
    if (decoded.length > 0) candidates.push(decoded);
    candidates.push(Buffer.from(stripped, "utf8"));
  }
  if (raw && raw !== stripped) candidates.push(Buffer.from(raw, "utf8"));
  return candidates;
}

function matches(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numeric(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

export const polarProvider: PaymentProvider = {
  id: "polar",

  async createCheckout(request: CheckoutRequest) {
    const response = await fetch(`${baseUrl()}/v1/checkouts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        products: [request.productId],
        customer_email: request.email,
        success_url: request.successUrl,
        metadata: {
          reference: request.reference,
          user_id: request.userId,
          project_slug: request.projectSlug,
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Polar checkout failed (${response.status}): ${detail.slice(0, 300)}`);
    }

    const payload = (await response.json()) as { id?: string; url?: string };
    if (!payload.url) throw new Error("Polar returned a checkout without a URL.");

    return { id: payload.id ?? request.reference, url: payload.url };
  },

  async verifyWebhook(rawBody: string, headers: WebhookHeaders) {
    const id = headerValue(headers, "webhook-id");
    const timestamp = headerValue(headers, "webhook-timestamp");
    const signatureHeader = headerValue(headers, "webhook-signature");
    if (!id || !timestamp || !signatureHeader) return false;

    const seconds = Number(timestamp);
    if (!Number.isFinite(seconds)) return false;
    if (Math.abs(Date.now() / 1000 - seconds) > TOLERANCE_SECONDS) return false;

    const signed = `${id}.${timestamp}.${rawBody}`;
    const signatures = signatureHeader
      .split(" ")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [version, value] = part.split(",", 2);
        return version === "v1" && value ? value : null;
      })
      .filter((value): value is string => Boolean(value));

    if (signatures.length === 0) return false;

    return keyCandidates(webhookSecret()).some((key) => {
      const expected = createHmac("sha256", key).update(signed).digest("base64");
      return signatures.some((signature) => matches(signature, expected));
    });
  },

  parseEvent(rawBody: string): PaymentEvent {
    const payload = JSON.parse(rawBody) as {
      type?: string;
      data?: {
        id?: string;
        order_id?: string;
        total_amount?: number;
        amount?: number;
        subtotal_amount?: number;
        currency?: string;
        metadata?: Record<string, unknown>;
        customer?: { email?: string };
        user?: { email?: string };
        email?: string;
      };
    };
    const data = payload.data ?? {};
    const metadata = data.metadata ?? {};

    const type =
      payload.type === "order.paid"
        ? "payment.succeeded"
        : payload.type === "order.refunded" || payload.type === "refund.created"
          ? "payment.refunded"
          : payload.type === "order.payment_failed"
            ? "payment.failed"
            : "ignored";

    return {
      id: text(payload.type) && data.id ? `${payload.type}:${data.id}` : "",
      type,
      provider: "polar",
      orderId: text(data.id) ?? text(data.order_id),
      amountCents: numeric(data.total_amount) ?? numeric(data.amount) ?? numeric(data.subtotal_amount),
      currency: text(data.currency),
      email: text(data.customer?.email) ?? text(data.user?.email) ?? text(data.email),
      reference: text(metadata.reference),
      projectSlug: text(metadata.project_slug),
      userId: text(metadata.user_id),
    };
  },
};
