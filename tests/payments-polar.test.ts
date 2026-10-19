import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { polarProvider } from "@/lib/payments/polar";

const key = Buffer.from("polar-webhook-test-key");
const secret = `whsec_${key.toString("base64")}`;
const originalSecret = process.env.POLAR_WEBHOOK_SECRET;

function signature(id: string, timestamp: string, body: string): string {
  const digest = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
  return `v1,${digest}`;
}

const body = JSON.stringify({
  type: "order.paid",
  data: {
    id: "order_1",
    total_amount: 4900,
    currency: "usd",
    customer: { email: "buyer@example.com" },
    metadata: { reference: "chk_1", user_id: "user_1", project_slug: "paid-project" },
  },
});

describe("polar provider", () => {
  beforeEach(() => {
    process.env.POLAR_WEBHOOK_SECRET = secret;
  });
  afterEach(() => {
    if (originalSecret === undefined) delete process.env.POLAR_WEBHOOK_SECRET;
    else process.env.POLAR_WEBHOOK_SECRET = originalSecret;
  });

  it("verifies a Standard Webhooks signature", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    expect(
      await polarProvider.verifyWebhook(body, {
        "webhook-id": "msg_1",
        "webhook-timestamp": timestamp,
        "webhook-signature": signature("msg_1", timestamp, body),
      }),
    ).toBe(true);
  });

  it("rejects a wrong signature, a stale timestamp and missing headers", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const fresh = signature("msg_1", timestamp, body);

    expect(
      await polarProvider.verifyWebhook(body, {
        "webhook-id": "msg_1",
        "webhook-timestamp": timestamp,
        "webhook-signature": fresh.replace(/.$/, "x"),
      }),
    ).toBe(false);

    const stale = String(Math.floor(Date.now() / 1000) - 3600);
    expect(
      await polarProvider.verifyWebhook(body, {
        "webhook-id": "msg_1",
        "webhook-timestamp": stale,
        "webhook-signature": signature("msg_1", stale, body),
      }),
    ).toBe(false);

    expect(await polarProvider.verifyWebhook(body, {})).toBe(false);
  });

  it("falls back to the legacy secret form", async () => {
    process.env.POLAR_WEBHOOK_SECRET = `polar_whs_${secret.slice("whsec_".length)}`;
    const timestamp = String(Math.floor(Date.now() / 1000));
    const legacyKey = Buffer.from(secret.slice("whsec_".length), "base64");
    const digest = createHmac("sha256", legacyKey)
      .update(`msg_2.${timestamp}.${body}`)
      .digest("base64");

    expect(
      await polarProvider.verifyWebhook(body, {
        "webhook-id": "msg_2",
        "webhook-timestamp": timestamp,
        "webhook-signature": `v1,${digest}`,
      }),
    ).toBe(true);
  });

  it("normalises order.paid and refunds", () => {
    const paid = polarProvider.parseEvent(body);
    expect(paid.type).toBe("payment.succeeded");
    expect(paid.orderId).toBe("order_1");
    expect(paid.amountCents).toBe(4900);
    expect(paid.email).toBe("buyer@example.com");
    expect(paid.reference).toBe("chk_1");
    expect(paid.projectSlug).toBe("paid-project");
    expect(paid.userId).toBe("user_1");

    const refunded = polarProvider.parseEvent(
      JSON.stringify({ type: "order.refunded", data: { id: "order_1" } }),
    );
    expect(refunded.type).toBe("payment.refunded");
  });
});
