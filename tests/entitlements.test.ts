import { describe, expect, it } from "vitest";
import { buildEntitlement, isEntitled } from "@/lib/payments/access";

const project = {
  isPaid: true,
  liveUrl: "https://app.example.com",
  deliveryNote: "License key: TEST-1234",
};

describe("entitlement gating", () => {
  it("only treats a paid purchase as access", () => {
    expect(isEntitled(null)).toBe(false);
    expect(isEntitled({ status: "pending" })).toBe(false);
    expect(isEntitled({ status: "failed" })).toBe(false);
    expect(isEntitled({ status: "refunded" })).toBe(false);
    expect(isEntitled({ status: "paid" })).toBe(true);
  });

  it("hides the URL and note without a paid purchase", () => {
    for (const purchase of [null, { status: "pending" as const }, { status: "refunded" as const }]) {
      const entitlement = buildEntitlement({ project, purchase, authenticated: true });
      expect(entitlement.purchased).toBe(false);
      expect(entitlement.liveUrl).toBeNull();
      expect(entitlement.deliveryNote).toBeNull();
    }
  });

  it("reveals both to a buyer", () => {
    const entitlement = buildEntitlement({
      project,
      purchase: { status: "paid" },
      authenticated: true,
    });
    expect(entitlement.purchased).toBe(true);
    expect(entitlement.liveUrl).toBe("https://app.example.com");
    expect(entitlement.deliveryNote).toBe("License key: TEST-1234");
  });

  it("gives a signed-out visitor nothing but the price", () => {
    const entitlement = buildEntitlement({ project, purchase: null, authenticated: false });

    expect(entitlement).toMatchObject({
      authenticated: false,
      purchased: false,
      liveUrl: null,
      deliveryNote: null,
    });
  });

  it("never marks a free project as purchased", () => {
    const entitlement = buildEntitlement({
      project: { ...project, isPaid: false },
      purchase: { status: "paid" },
      authenticated: true,
    });
    expect(entitlement.purchased).toBe(false);
    expect(entitlement.liveUrl).toBeNull();
  });
});
