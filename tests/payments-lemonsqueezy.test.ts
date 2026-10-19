import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { lemonSqueezyProvider } from "@/lib/payments/lemonsqueezy";

const secret = "lemon-test-secret";
const original = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

const body = JSON.stringify({
  meta: {
    event_name: "order_created",
    custom_data: { reference: "chk_1", user_id: "user_1", project_slug: "paid-project" },
  },
  data: { id: "order_77", attributes: { total: 4900, currency: "USD", user_email: "buyer@example.com" } },
});

function sign(raw: string): string {
  return createHmac("sha256", secret).update(raw).digest("hex");
}

describe("lemon squeezy provider", () => {
  beforeEach(() => {
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = secret;
  });
  afterEach(() => {
    if (original === undefined) delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    else process.env.LEMONSQUEEZY_WEBHOOK_SECRET = original;
  });

  it("verifies the hex HMAC of the raw body", async () => {
    expect(await lemonSqueezyProvider.verifyWebhook(body, { "x-signature": sign(body) })).toBe(true);
  });

  it("rejects a tampered body or missing signature", async () => {
    const signature = sign(body);
    expect(
      await lemonSqueezyProvider.verifyWebhook(body.replace("4900", "1"), {
        "x-signature": signature,
      }),
    ).toBe(false);
    expect(await lemonSqueezyProvider.verifyWebhook(body, {})).toBe(false);
  });

  it("normalises an order and a refund", () => {
    const event = lemonSqueezyProvider.parseEvent(body);
    expect(event.type).toBe("payment.succeeded");
    expect(event.orderId).toBe("order_77");
    expect(event.amountCents).toBe(4900);
    expect(event.currency).toBe("USD");
    expect(event.email).toBe("buyer@example.com");
    expect(event.reference).toBe("chk_1");
    expect(event.projectSlug).toBe("paid-project");
    expect(event.userId).toBe("user_1");

    const refund = lemonSqueezyProvider.parseEvent(
      JSON.stringify({
        meta: { event_name: "order_refunded", custom_data: { reference: "chk_1" } },
        data: { id: "order_77", attributes: {} },
      }),
    );
    expect(refund.type).toBe("payment.refunded");
  });
});
