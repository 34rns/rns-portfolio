import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, projects } from "@/lib/db/schema";
import { withRetry } from "@/lib/db/queries";
import type {
  NewOrder,
  OrderPatch,
  OrderProject,
  OrderRecord,
  OrderRow,
  OrderStore,
} from "./store";

const projectColumns = {
  id: projects.id,
  slug: projects.slug,
  title: projects.title,
  status: projects.status,
  isPaid: projects.isPaid,
  priceCents: projects.priceCents,
  currency: projects.currency,
  downloadUrl: projects.downloadUrl,
};

function searchTerm(query: string) {
  const term = `%${query.trim().replace(/[%_]/g, "")}%`;
  return or(
    ilike(orders.name, term),
    ilike(orders.email, term),
    ilike(projects.title, term),
  );
}

export const dbOrderStore: OrderStore = {
  async getProjectBySlug(slug) {
    const rows = await withRetry(() =>
      db.select(projectColumns).from(projects).where(eq(projects.slug, slug)).limit(1),
    );
    return (rows[0] as OrderProject | undefined) ?? null;
  },

  async getProjectById(id) {
    const rows = await withRetry(() =>
      db.select(projectColumns).from(projects).where(eq(projects.id, id)).limit(1),
    );
    return (rows[0] as OrderProject | undefined) ?? null;
  },

  async createOrder(input: NewOrder) {
    const rows = await withRetry(() => db.insert(orders).values(input).returning());
    if (!rows[0]) throw new Error("Could not record the order.");
    return rows[0];
  },

  async findOrderByTokenHash(hash) {
    const rows = await withRetry(() =>
      db.select().from(orders).where(eq(orders.tokenHash, hash)).limit(1),
    );
    return rows[0] ?? null;
  },

  async findOrderById(id) {
    const rows = await withRetry(() => db.select().from(orders).where(eq(orders.id, id)).limit(1));
    return rows[0] ?? null;
  },

  async updateOrder(id, patch: OrderPatch) {
    await withRetry(() =>
      db
        .update(orders)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(orders.id, id)),
    );
  },

  async listOrders({ status, query, page = 0, perPage = 50 }) {
    const rows = await withRetry(() =>
      db
        .select({
          order: orders,
          projectTitle: projects.title,
          projectSlug: projects.slug,
        })
        .from(orders)
        .innerJoin(projects, eq(orders.projectId, projects.id))
        .where(
          and(
            status ? eq(orders.status, status) : undefined,
            query?.trim() ? searchTerm(query) : undefined,
          ),
        )
        .orderBy(desc(orders.createdAt))
        .limit(perPage)
        .offset(Math.max(0, page) * perPage),
    );

    return rows.map(
      (row) =>
        ({
          ...row.order,
          projectTitle: row.projectTitle,
          projectSlug: row.projectSlug,
        }) satisfies OrderRow,
    );
  },

  async countOrders({ status, query }) {
    const rows = await withRetry(() =>
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(orders)
        .innerJoin(projects, eq(orders.projectId, projects.id))
        .where(
          and(
            status ? eq(orders.status, status) : undefined,
            query?.trim() ? searchTerm(query) : undefined,
          ),
        ),
    );
    return rows[0]?.value ?? 0;
  },
};

export type { OrderRecord };
