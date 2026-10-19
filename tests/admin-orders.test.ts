import { describe, expect, it } from "vitest";
import { buildEntitlement } from "@/lib/payments/access";
import { grantAccess, revokeAccess } from "@/lib/payments/admin";
import { createMemoryAdminStore, seedPurchase } from "./helpers/admin-store";
import { createMemoryStore, seedProject } from "./helpers/memory-store";

const admin = "admin@example.com";

describe("manual access grants", () => {
  it("creates a paid $0 manual order and records the grant", async () => {
    const { store, purchases, audits } = createMemoryAdminStore();

    const result = await grantAccess(store, {
      projectId: "project_1",
      email: "  Buyer@Example.com ",
      actorEmail: admin,
      reason: "  Client comp  ",
      reference: "manual_test",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.changed).toBe(true);
    expect(result.purchase.provider).toBe("manual");
    expect(result.purchase.status).toBe("paid");
    expect(result.purchase.amountCents).toBe(0);
    expect(result.purchase.reference).toBe("manual_test");
    expect(purchases.size).toBe(1);

    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({
      action: "grant",
      actorEmail: admin,
      buyerEmail: "buyer@example.com",
      projectTitle: "Paid Project",
      reason: "Client comp",
      amountCents: 0,
      currency: "USD",
      purchaseId: result.purchase.id,
    });

    const entitlement = buildEntitlement({
      project: (await store.getProjectById("project_1"))!,
      purchase: await store.findEntitlement("user_1", "project_1"),
      authenticated: true,
    });
    expect(entitlement.purchased).toBe(true);
    expect(entitlement.liveUrl).toBe("https://app.example.com");
    expect(entitlement.deliveryNote).toContain("TEST-1234");
  });

  it("changes nothing when the buyer already has access", async () => {
    const { store, purchases, audits } = createMemoryAdminStore({
      purchases: [seedPurchase({ status: "paid" })],
    });

    const result = await grantAccess(store, {
      projectId: "project_1",
      email: "buyer@example.com",
      actorEmail: admin,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.changed).toBe(false);
    expect(result.purchase.id).toBe("purchase_seeded");
    expect(purchases.size).toBe(1);
    expect(audits).toHaveLength(0);
  });

  it("adds a new comp instead of rewriting an earlier failed order", async () => {
    const { store, purchases, audits } = createMemoryAdminStore({
      purchases: [seedPurchase({ status: "failed", id: "purchase_failed" })],
    });

    const result = await grantAccess(store, {
      projectId: "project_1",
      email: "buyer@example.com",
      actorEmail: admin,
      reference: "manual_retry",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(purchases.size).toBe(2);
    expect(purchases.get("purchase_failed")?.status).toBe("failed");
    expect((await store.findEntitlement("user_1", "project_1"))?.provider).toBe("manual");
    expect(audits).toHaveLength(1);
  });

  it("refuses an unknown buyer, a free project or a missing project", async () => {
    const { store, audits } = createMemoryAdminStore({
      projects: [
        seedProject(),
        seedProject({ id: "project_free", slug: "free", isPaid: false, priceCents: null }),
      ],
    });

    const unknown = await grantAccess(store, {
      projectId: "project_1",
      email: "nobody@example.com",
      actorEmail: admin,
    });
    expect(unknown.ok).toBe(false);
    if (!unknown.ok) expect(unknown.status).toBe(404);

    const free = await grantAccess(store, {
      projectId: "project_free",
      email: "buyer@example.com",
      actorEmail: admin,
    });
    expect(free.ok).toBe(false);
    if (!free.ok) expect(free.status).toBe(400);

    const missing = await grantAccess(store, {
      projectId: "project_missing",
      email: "buyer@example.com",
      actorEmail: admin,
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.status).toBe(404);

    const blank = await grantAccess(store, {
      projectId: "project_1",
      email: "   ",
      actorEmail: admin,
    });
    expect(blank.ok).toBe(false);
    if (!blank.ok) expect(blank.status).toBe(400);

    expect(audits).toHaveLength(0);
  });
});

describe("manual revocations", () => {
  it("flips a paid order to refunded, locks the content and audits the actor", async () => {
    const { store, audits } = createMemoryAdminStore();

    const granted = await grantAccess(store, {
      projectId: "project_1",
      email: "buyer@example.com",
      actorEmail: admin,
      reference: "manual_revoke_me",
    });
    expect(granted.ok).toBe(true);
    if (!granted.ok) return;

    const revoked = await revokeAccess(store, {
      purchaseId: granted.purchase.id,
      actorEmail: admin,
      reason: "Chargeback",
    });

    expect(revoked.ok).toBe(true);
    if (!revoked.ok) return;
    expect(revoked.purchase.status).toBe("refunded");
    expect((await store.findPurchaseById(granted.purchase.id))?.status).toBe("refunded");

    const entitlement = buildEntitlement({
      project: (await store.getProjectById("project_1"))!,
      purchase: await store.findEntitlement("user_1", "project_1"),
      authenticated: true,
    });
    expect(entitlement.purchased).toBe(false);
    expect(entitlement.liveUrl).toBeNull();
    expect(entitlement.deliveryNote).toBeNull();

    expect(audits).toHaveLength(2);
    expect(audits[1]).toMatchObject({
      action: "revoke",
      actorEmail: admin,
      buyerEmail: "buyer@example.com",
      reason: "Chargeback",
      purchaseId: granted.purchase.id,
    });
  });

  it("refuses a pending order and an unknown purchase", async () => {
    const { store, purchases, audits } = createMemoryAdminStore({
      purchases: [seedPurchase({ status: "pending" })],
    });

    const pending = await revokeAccess(store, {
      purchaseId: "purchase_seeded",
      actorEmail: admin,
    });
    expect(pending.ok).toBe(false);
    if (!pending.ok) expect(pending.status).toBe(409);
    expect(purchases.get("purchase_seeded")?.status).toBe("pending");

    const missing = await revokeAccess(store, {
      purchaseId: "purchase_missing",
      actorEmail: admin,
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.status).toBe(404);

    expect(audits).toHaveLength(0);
  });
});

describe("revenue accounting", () => {
  it("keeps comped access out of paid order counts and revenue", async () => {
    const { store, purchases } = createMemoryStore();

    purchases.set(
      "purchase_paid",
      seedPurchase({ id: "purchase_paid", reference: "chk_paid", status: "paid" }),
    );
    purchases.set(
      "purchase_comp",
      seedPurchase({
        id: "purchase_comp",
        reference: "manual_comp",
        provider: "manual",
        providerOrderId: null,
        status: "paid",
        amountCents: 0,
      }),
    );

    const stats = await store.commerceStats();
    expect(stats.paidOrders).toBe(1);
    expect(stats.revenue).toEqual([{ currency: "USD", cents: 4900 }]);
  });
});
