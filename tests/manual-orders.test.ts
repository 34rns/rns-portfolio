import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MIN_FILL_MS,
  checkSubmissionGuards,
  orderProgress,
  orderRequestSchema,
  parseAmountToCents,
  requestProOrder,
  updateOrder,
} from "@/lib/orders/service";
import { buildInstallSteps, buildOrderMessage } from "@/lib/orders/template";
import { generateOrderToken, normalizeOrderToken, orderTokenHash } from "@/lib/orders/token";
import { createMemoryOrderStore, seedOrderProject } from "./helpers/memory-order-store";

const SECRET = "vitest-license-secret-that-is-long-enough";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the order token", () => {
  it("is long, random and never stored in the clear", async () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);

    const tokens = new Set(Array.from({ length: 1000 }, () => generateOrderToken()));
    expect(tokens.size).toBe(1000);
    for (const token of tokens) {
      expect(token).toHaveLength(43); // 256 bits, base64url
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    }

    const { store, orders } = createMemoryOrderStore();
    const result = await requestProOrder({
      store,
      input: { slug: "paid-project", name: "Ada", email: "ada@example.com" },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const stored = [...orders.values()][0];
    expect(stored.tokenHash).toBe(orderTokenHash(result.token));
    expect(stored.tokenHash).toHaveLength(64);
    expect(JSON.stringify(stored)).not.toContain(result.token);
  });

  it("rejects anything that is not a token before it reaches the database", () => {
    expect(normalizeOrderToken(generateOrderToken())).toBeTruthy();
    expect(normalizeOrderToken("short")).toBeNull();
    expect(normalizeOrderToken("has spaces in it but is long enough to pass")).toBeNull();
    expect(normalizeOrderToken(`"${generateOrderToken()}"`)).toBeNull();
    expect(normalizeOrderToken("")).toBeNull();
    expect(normalizeOrderToken(null)).toBeNull();
    expect(normalizeOrderToken("a".repeat(200))).toBeNull();
  });
});

describe("requesting Pro", () => {
  it("creates an order for a paid, published project", async () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);
    const { store } = createMemoryOrderStore();

    const result = await requestProOrder({
      store,
      input: {
        slug: "paid-project",
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "  paying by bKash  ",
        method: "bKash",
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.order.status).toBe("requested");
    expect(result.order.amountCents).toBe(4900);
    expect(result.order.currency).toBe("USD");
    expect(result.order.message).toBe("paying by bKash");
    expect(result.order.method).toBe("bKash");
    expect(result.order.tokenCiphertext).not.toContain(result.token);
  });

  it("refuses a free, unpublished or unknown project", async () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);
    const { store } = createMemoryOrderStore({
      projects: [
        seedOrderProject(),
        seedOrderProject({ id: "project_2", slug: "free-project", isPaid: false }),
        seedOrderProject({ id: "project_3", slug: "draft-project", status: "draft" }),
      ],
    });

    for (const slug of ["free-project", "draft-project", "nothing-here"]) {
      const result = await requestProOrder({
        store,
        input: { slug, name: "Ada", email: "ada@example.com" },
      });
      expect(result).toMatchObject({ ok: false, status: 404 });
    }
  });

  it("refuses instead of handing out a link it cannot reopen", async () => {
    vi.stubEnv("LICENSE_SECRET", "");
    const { store } = createMemoryOrderStore();

    const result = await requestProOrder({
      store,
      input: { slug: "paid-project", name: "Ada", email: "ada@example.com" },
    });

    expect(result).toMatchObject({ ok: false, status: 503 });
  });

  it("validates what the form sends", () => {
    expect(orderRequestSchema.safeParse({ slug: "p", name: "A", email: "a@b.co" }).success).toBe(true);
    expect(orderRequestSchema.safeParse({ slug: "p", name: "", email: "a@b.co" }).success).toBe(false);
    expect(orderRequestSchema.safeParse({ slug: "p", name: "A", email: "nope" }).success).toBe(false);
    expect(
      orderRequestSchema.safeParse({ slug: "p", name: "A", email: "a@b.co", message: "x".repeat(2001) })
        .success,
    ).toBe(false);
  });
});

describe("spam guards", () => {
  const now = 1_800_000_000_000;

  it("catches a filled honeypot", () => {
    expect(checkSubmissionGuards({ website: "http://spam", renderedAt: now - 5000, now })).toEqual({
      ok: false,
      reason: "honeypot",
    });
  });

  it("catches a form filled faster than a person could", () => {
    expect(checkSubmissionGuards({ website: "", renderedAt: now - (MIN_FILL_MS - 1), now })).toEqual({
      ok: false,
      reason: "too-fast",
    });
    expect(checkSubmissionGuards({ website: "", renderedAt: null, now })).toEqual({
      ok: false,
      reason: "too-fast",
    });
  });

  it("ignores a stale render instead of accepting it", () => {
    expect(checkSubmissionGuards({ website: "", renderedAt: now - 48 * 60 * 60 * 1000, now })).toEqual({
      ok: false,
      reason: "too-old",
    });
  });

  it("accepts a real submission, including a slightly future clock", () => {
    expect(checkSubmissionGuards({ website: "", renderedAt: now - 6000, now })).toEqual({ ok: true });
    expect(checkSubmissionGuards({ website: "", renderedAt: now + 5000, now })).toEqual({ ok: true });
  });
});

describe("the admin side of an order", () => {
  it("moves status, amount and notes", async () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);
    const { store } = createMemoryOrderStore();
    const created = await requestProOrder({
      store,
      input: { slug: "paid-project", name: "Ada", email: "ada@example.com" },
    });
    if (!created.ok) throw new Error("order not created");

    const updated = await updateOrder({
      store,
      id: created.order.id,
      status: "paid",
      notes: "bKash txn 8812",
      amountCents: 1500,
      currency: "bdt",
    });

    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.order.status).toBe("paid");
    expect(updated.order.amountCents).toBe(1500);
    expect(updated.order.currency).toBe("BDT");
    expect(updated.order.notes).toBe("bKash txn 8812");
  });

  it("refuses an unknown status, a bad currency or an out-of-range amount", async () => {
    vi.stubEnv("LICENSE_SECRET", SECRET);
    const { store } = createMemoryOrderStore();
    const created = await requestProOrder({
      store,
      input: { slug: "paid-project", name: "Ada", email: "ada@example.com" },
    });
    if (!created.ok) throw new Error("order not created");

    expect(await updateOrder({ store, id: created.order.id, status: "shipped" })).toMatchObject({
      ok: false,
      status: 400,
    });
    expect(await updateOrder({ store, id: created.order.id, currency: "dollars" })).toMatchObject({
      ok: false,
    });
    expect(
      await updateOrder({ store, id: created.order.id, amountCents: 99_999_999 }),
    ).toMatchObject({ ok: false });
    expect(await updateOrder({ store, id: "missing", status: "paid" })).toMatchObject({
      ok: false,
      status: 404,
    });
  });

  it("parses the amount field the way a person types it", () => {
    expect(parseAmountToCents("19")).toBe(1900);
    expect(parseAmountToCents("19.5")).toBe(1950);
    expect(parseAmountToCents("1,250.75")).toBe(125075);
    expect(parseAmountToCents("")).toBeNull();
    expect(parseAmountToCents("lots")).toBeUndefined();
    expect(parseAmountToCents("-5")).toBeUndefined();
  });

  it("walks the buyer's rail and stops it when cancelled", () => {
    const requested = orderProgress("requested");
    expect(requested.cancelled).toBe(false);
    expect(requested.steps.map((step) => step.done)).toEqual([true, false, false]);

    const paid = orderProgress("paid");
    expect(paid.steps.every((step) => step.done)).toBe(true);

    const cancelled = orderProgress("cancelled");
    expect(cancelled.cancelled).toBe(true);
    expect(cancelled.steps.every((step) => !step.done)).toBe(true);
  });
});

describe("the message an admin sends", () => {
  const order = {
    id: "order_1",
    projectId: "project_1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: null,
    method: "bKash",
    status: "paid" as const,
    amountCents: 1900,
    currency: "USD",
    notes: null,
    tokenHash: "hash",
    tokenCiphertext: "cipher",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };

  it("carries the key, the amount, the steps and the order link", () => {
    const message = buildOrderMessage({
      channel: "whatsapp",
      order,
      projectTitle: "Paid Project",
      key: "ABCDE-FGHJK-LMNPQ-RSTUV",
      orderUrl: "https://rns.example.com/order/token",
    });

    expect(message.body).toContain("Ada");
    expect(message.body).toContain("$19");
    expect(message.body).toContain("ABCDE-FGHJK-LMNPQ-RSTUV");
    expect(message.body).toContain("https://rns.example.com/order/token");
    expect(message.body).toContain(buildInstallSteps("Paid Project")[0]);
    expect(message.subject).toBeNull();
  });

  it("gives email a subject and withholds a key that does not exist yet", () => {
    const message = buildOrderMessage({
      channel: "email",
      order: { ...order, status: "contacted" },
      projectTitle: "Paid Project",
      key: null,
      orderUrl: "https://rns.example.com/order/token",
    });

    expect(message.subject).toBe("Your Paid Project license key");
    expect(message.body).not.toMatch(/[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}/);
    expect(message.body).toMatch(/follows once payment clears/i);
  });
});

describe("the buyer's page", () => {
  it("is noindex and account-free", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/portfolio");
    const page = await import("@/app/order/[token]/page");

    expect(page.metadata.robots).toMatchObject({ index: false, follow: false, nocache: true });
    expect(page.dynamic).toBe("force-dynamic");
  });
});
