import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projects, purchases, users } from "@/lib/db/schema";
import { withRetry } from "@/lib/db/queries";
import type {
  CheckoutProject,
  CommerceStats,
  NewPurchase,
  PaymentStore,
  PurchaseWithProject,
} from "./store";

const projectColumns = {
  id: projects.id,
  slug: projects.slug,
  title: projects.title,
  isPaid: projects.isPaid,
  status: projects.status,
  priceCents: projects.priceCents,
  currency: projects.currency,
  providerProductId: projects.providerProductId,
  liveUrl: projects.liveUrl,
  deliveryNote: projects.deliveryNote,
};

export const dbStore: PaymentStore = {
  async getProjectBySlug(slug) {
    const rows = await withRetry(() =>
      db.select(projectColumns).from(projects).where(eq(projects.slug, slug)).limit(1),
    );
    return (rows[0] as CheckoutProject | undefined) ?? null;
  },

  async getProjectById(id) {
    const rows = await withRetry(() =>
      db.select(projectColumns).from(projects).where(eq(projects.id, id)).limit(1),
    );
    return (rows[0] as CheckoutProject | undefined) ?? null;
  },

  async userExists(id) {
    const rows = await withRetry(() =>
      db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1),
    );
    return rows.length > 0;
  },

  async createPurchase(input: NewPurchase) {
    const inserted = await withRetry(() =>
      db.insert(purchases).values(input).onConflictDoNothing().returning(),
    );
    if (inserted[0]) return inserted[0];

    const existing = await withRetry(() =>
      db
        .select()
        .from(purchases)
        .where(eq(purchases.reference, input.reference))
        .limit(1),
    );
    if (!existing[0]) throw new Error("Could not record the purchase.");
    return existing[0];
  },

  async updatePurchase(id, patch) {
    await withRetry(() =>
      db
        .update(purchases)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(purchases.id, id)),
    );
  },

  async findPurchaseByReference(reference) {
    const rows = await withRetry(() =>
      db.select().from(purchases).where(eq(purchases.reference, reference)).limit(1),
    );
    return rows[0] ?? null;
  },

  async findPurchaseByOrder(provider, orderId) {
    const rows = await withRetry(() =>
      db
        .select()
        .from(purchases)
        .where(and(eq(purchases.provider, provider), eq(purchases.providerOrderId, orderId)))
        .limit(1),
    );
    return rows[0] ?? null;
  },

  async recordWebhookEvent({ provider, eventId, type }) {
    const rows = await withRetry(() =>
      db.execute(
        sql`insert into processed_webhook_events (provider, event_id, type)
            values (${provider}, ${eventId}, ${type})
            on conflict (provider, event_id) do nothing
            returning id`,
      ),
    );
    return rows.rows.length > 0;
  },

  async findEntitlement(userId, projectId) {
    const rows = await withRetry(() =>
      db
        .select()
        .from(purchases)
        .where(and(eq(purchases.userId, userId), eq(purchases.projectId, projectId)))
        .orderBy(desc(purchases.createdAt))
        .limit(1),
    );
    return rows[0] ?? null;
  },

  async listPurchases(userId) {
    const rows = await withRetry(() =>
      db
        .select({
          purchase: purchases,
          projectTitle: projects.title,
          projectSlug: projects.slug,
        })
        .from(purchases)
        .innerJoin(projects, eq(purchases.projectId, projects.id))
        .where(eq(purchases.userId, userId))
        .orderBy(desc(purchases.createdAt)),
    );

    return rows.map((row) => ({
      ...row.purchase,
      projectTitle: row.projectTitle,
      projectSlug: row.projectSlug,
    })) satisfies PurchaseWithProject[];
  },

  async commerceStats(): Promise<CommerceStats> {
    const [signupRows, revenueRows] = await Promise.all([
      withRetry(() =>
        db
          .select({ value: sql<number>`count(*)::int` })
          .from(users)
          .where(eq(users.role, "customer")),
      ),
      withRetry(() =>
        db
          .select({
            currency: purchases.currency,
            cents: sql<number>`coalesce(sum(${purchases.amountCents}), 0)::int`,
            orders: sql<number>`count(*)::int`,
          })
          .from(purchases)
          // Comped access is a $0 manual row; it is not revenue or an order.
          .where(and(eq(purchases.status, "paid"), ne(purchases.provider, "manual")))
          .groupBy(purchases.currency),
      ),
    ]);

    return {
      signups: signupRows[0]?.value ?? 0,
      paidOrders: revenueRows.reduce((total, row) => total + row.orders, 0),
      revenue: revenueRows.map((row) => ({ currency: row.currency, cents: row.cents })),
    };
  },
};
