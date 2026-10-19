import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { mockEventBody, mockProvider, signMockPayload } from "@/lib/payments/mock";
import { polarProvider } from "@/lib/payments/polar";
import { handlePaymentWebhook } from "@/lib/payments/webhook";
import { createMemoryStore } from "./helpers/memory-store";

const successBody = mockEventBody({
  type: "payment.succeeded",
  reference: "chk_1",
  amountCents: 4900,
  currency: "USD",
  email: "buyer@example.com",
  userId: "user_1",
  projectSlug: "paid-project",
});

async function deliver(body: string, signature = signMockPayload(body)) {
  const { store, purchases, events } = createMemoryStore();
  await store.createPurchase({
    reference: "chk_1",
    userId: "user_1",
    projectId: "project_1",
    provider: "mock",
    providerOrderId: "chk_1",
    status: "pending",
    amountCents: 4900,
    currency: "USD",
  });

  const result = await handlePaymentWebhook({
    provider: mockProvider,
    store,
    rawBody: body,
    headers: { "x-mock-signature": signature },
  });

  return { result, store, purchases, events };
}

describe("payment webhooks", () => {
  it("verifies the signature before touching the ledger", async () => {
    const { result, purchases, events } = await deliver(
      successBody,
      signMockPayload(successBody + " "),
    );

    expect(result.status).toBe(401);
    expect(purchases.size).toBe(1);
    expect([...purchases.values()][0].status).toBe("pending");
    expect(events.size).toBe(0);
  });

  it("grants access once and ignores a replayed event", async () => {
    const { result, store, purchases } = await deliver(successBody);
    expect(result.status).toBe(200);
    expect([...purchases.values()][0].status).toBe("paid");

    const replay = await handlePaymentWebhook({
      provider: mockProvider,
      store,
      rawBody: successBody,
      headers: { "x-mock-signature": signMockPayload(successBody) },
    });
    expect(replay.duplicate).toBe(true);

    const entitlement = await store.findEntitlement("user_1", "project_1");
    expect(entitlement?.status).toBe("paid");
    expect(purchases.size).toBe(1);
  });

  it("marks a failed payment without granting access", async () => {
    const failedBody = mockEventBody({
      type: "payment.failed",
      reference: "chk_1",
      amountCents: 4900,
      currency: "USD",
      email: "buyer@example.com",
      userId: "user_1",
      projectSlug: "paid-project",
    });

    const { result, store } = await deliver(failedBody, signMockPayload(failedBody));
    expect(result.status).toBe(200);
    expect((await store.findEntitlement("user_1", "project_1"))?.status).toBe("failed");
  });

  it("refunds and revokes access", async () => {
    const key = Buffer.from("polar-refund-key");
    const secret = `whsec_${key.toString("base64")}`;
    const original = process.env.POLAR_WEBHOOK_SECRET;
    process.env.POLAR_WEBHOOK_SECRET = secret;

    try {
      const { store } = createMemoryStore();
      await store.createPurchase({
        reference: "chk_refund",
        userId: "user_1",
        projectId: "project_1",
        provider: "polar",
        providerOrderId: "order_9",
        status: "paid",
        amountCents: 4900,
        currency: "USD",
      });

      const body = JSON.stringify({
        type: "order.refunded",
        data: { id: "order_9", metadata: { reference: "chk_refund" } },
      });
      const timestamp = String(Math.floor(Date.now() / 1000));
      const digest = createHmac("sha256", key)
        .update(`msg_refund.${timestamp}.${body}`)
        .digest("base64");

      const result = await handlePaymentWebhook({
        provider: polarProvider,
        store,
        rawBody: body,
        headers: {
          "webhook-id": "msg_refund",
          "webhook-timestamp": timestamp,
          "webhook-signature": `v1,${digest}`,
        },
      });

      expect(result.status).toBe(200);
      expect((await store.findEntitlement("user_1", "project_1"))?.status).toBe("refunded");
    } finally {
      if (original === undefined) delete process.env.POLAR_WEBHOOK_SECRET;
      else process.env.POLAR_WEBHOOK_SECRET = original;
    }
  });

  it("rejects a payment it cannot attribute", async () => {
    const { store } = createMemoryStore();
    const body = mockEventBody({
      type: "payment.succeeded",
      reference: "chk_unknown",
      amountCents: 4900,
      currency: "USD",
      email: "buyer@example.com",
      userId: "user_1",
      projectSlug: "missing-project",
    });

    const result = await handlePaymentWebhook({
      provider: mockProvider,
      store,
      rawBody: body,
      headers: { "x-mock-signature": signMockPayload(body) },
    });

    expect(result.status).toBe(422);
  });
});
