import { describe, expect, it } from "vitest";
import { mockEventBody, mockProvider, signMockPayload } from "@/lib/payments/mock";

const successBody = mockEventBody({
  type: "payment.succeeded",
  reference: "chk_1",
  amountCents: 4900,
  currency: "USD",
  email: "buyer@example.com",
  userId: "user_1",
  projectSlug: "paid-project",
});

describe("mock provider", () => {
  it("accepts a signature it produced", async () => {
    expect(
      await mockProvider.verifyWebhook(successBody, {
        "x-mock-signature": signMockPayload(successBody),
      }),
    ).toBe(true);
  });

  it("rejects a tampered body and a missing signature", async () => {
    const signature = signMockPayload(successBody);
    expect(
      await mockProvider.verifyWebhook(successBody.replace("4900", "1"), {
        "x-mock-signature": signature,
      }),
    ).toBe(false);
    expect(await mockProvider.verifyWebhook(successBody, {})).toBe(false);
  });

  it("normalises a successful payment", () => {
    const event = mockProvider.parseEvent(successBody);
    expect(event.type).toBe("payment.succeeded");
    expect(event.reference).toBe("chk_1");
    expect(event.orderId).toBe("chk_1");
    expect(event.amountCents).toBe(4900);
    expect(event.currency).toBe("USD");
    expect(event.projectSlug).toBe("paid-project");
    expect(event.userId).toBe("user_1");
    expect(event.id).toContain("chk_1");
  });

  it("normalises a failure and ignores unknown types", () => {
    const failed = mockProvider.parseEvent(
      mockEventBody({
        type: "payment.failed",
        reference: "chk_2",
        amountCents: 4900,
        currency: "USD",
        email: "buyer@example.com",
        userId: "user_1",
        projectSlug: "paid-project",
      }),
    );
    expect(failed.type).toBe("payment.failed");

    const other = mockProvider.parseEvent(JSON.stringify({ id: "evt_1", type: "ping" }));
    expect(other.type).toBe("ignored");
  });
});
