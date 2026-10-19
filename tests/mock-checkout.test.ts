import { describe, expect, it } from "vitest";
import { buildEntitlement } from "@/lib/payments/access";
import { startCheckout } from "@/lib/payments/checkout";
import { mockEventBody, mockProvider, signMockPayload } from "@/lib/payments/mock";
import { handlePaymentWebhook } from "@/lib/payments/webhook";
import type { PaymentProvider } from "@/lib/payments/types";
import { createMemoryStore, seedProject } from "./helpers/memory-store";

const user = { id: "user_1", email: "buyer@example.com" };

describe("mock checkout end to end", () => {
  it("creates a pending purchase, then grants access on the signed webhook", async () => {
    const { store, purchases } = createMemoryStore();

    const checkout = await startCheckout({
      store,
      provider: mockProvider,
      user,
      slug: "paid-project",
      origin: "http://localhost:3100",
      reference: "chk_test",
    });

    expect(checkout.ok).toBe(true);
    if (!checkout.ok) return;
    expect(checkout.url).toBe("http://localhost:3100/checkout/mock/chk_test");
    expect([...purchases.values()][0].status).toBe("pending");

    const body = mockEventBody({
      type: "payment.succeeded",
      reference: "chk_test",
      amountCents: 4900,
      currency: "USD",
      email: user.email,
      userId: user.id,
      projectSlug: "paid-project",
    });

    const result = await handlePaymentWebhook({
      provider: mockProvider,
      store,
      rawBody: body,
      headers: { "x-mock-signature": signMockPayload(body) },
    });
    expect(result.status).toBe(200);

    const purchase = await store.findEntitlement(user.id, "project_1");
    const project = await store.getProjectBySlug("paid-project");
    const entitlement = buildEntitlement({
      project: project!,
      purchase,
      authenticated: true,
    });

    expect(entitlement.purchased).toBe(true);
    expect(entitlement.liveUrl).toBe("https://app.example.com");
    expect(entitlement.deliveryNote).toContain("TEST-1234");
  });

  it("leaves access locked when the payment fails", async () => {
    const { store } = createMemoryStore();
    await startCheckout({
      store,
      provider: mockProvider,
      user,
      slug: "paid-project",
      origin: "http://localhost:3100",
      reference: "chk_fail",
    });

    const body = mockEventBody({
      type: "payment.failed",
      reference: "chk_fail",
      amountCents: 4900,
      currency: "USD",
      email: user.email,
      userId: user.id,
      projectSlug: "paid-project",
    });
    await handlePaymentWebhook({
      provider: mockProvider,
      store,
      rawBody: body,
      headers: { "x-mock-signature": signMockPayload(body) },
    });

    const entitlement = buildEntitlement({
      project: (await store.getProjectBySlug("paid-project"))!,
      purchase: await store.findEntitlement(user.id, "project_1"),
      authenticated: true,
    });
    expect(entitlement.purchased).toBe(false);
    expect(entitlement.liveUrl).toBeNull();
  });

  it("refuses a project that is not for sale or not published", async () => {
    const { store } = createMemoryStore({
      projects: [
        seedProject(),
        seedProject({ id: "project_2", slug: "draft-paid", status: "draft" }),
        seedProject({ id: "project_3", slug: "free", isPaid: false, priceCents: null }),
      ],
    });

    const missing = await startCheckout({
      store,
      provider: mockProvider,
      user,
      slug: "nope",
      origin: "http://localhost:3100",
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.status).toBe(404);

    const free = await startCheckout({
      store,
      provider: mockProvider,
      user,
      slug: "free",
      origin: "http://localhost:3100",
    });
    expect(free.ok).toBe(false);
    if (!free.ok) expect(free.status).toBe(400);

    const draft = await startCheckout({
      store,
      provider: mockProvider,
      user,
      slug: "draft-paid",
      origin: "http://localhost:3100",
    });
    expect(draft.ok).toBe(false);
    if (!draft.ok) expect(draft.status).toBe(404);
  });

  it("rejects a buyer without a customer row and marks a failed provider call", async () => {
    const { store, purchases } = createMemoryStore({ users: [] });
    const refused = await startCheckout({
      store,
      provider: mockProvider,
      user,
      slug: "paid-project",
      origin: "http://localhost:3100",
    });
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.status).toBe(403);

    const { store: second } = createMemoryStore();
    const broken: PaymentProvider = {
      id: "mock",
      async createCheckout() {
        throw new Error("provider unavailable");
      },
      async verifyWebhook() {
        return false;
      },
      parseEvent() {
        throw new Error("unused");
      },
    };

    const result = await startCheckout({
      store: second,
      provider: broken,
      user,
      slug: "paid-project",
      origin: "http://localhost:3100",
      reference: "chk_broken",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("provider unavailable");
    expect((await second.findPurchaseByReference("chk_broken"))?.status).toBe("failed");
    expect(purchases.size).toBe(0);
  });
});
