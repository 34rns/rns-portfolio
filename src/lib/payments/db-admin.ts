import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  projects,
  purchaseAuditLog,
  purchases,
  users,
  type PurchaseAuditRecord,
  type PurchaseRecord,
  type PurchaseStatus,
} from "@/lib/db/schema";
import { withRetry } from "@/lib/db/queries";
import type { AdminAccessStore } from "./admin";
import { dbStore } from "./db-store";

export type AdminOrderRow = PurchaseRecord & {
  buyerEmail: string;
  buyerName: string | null;
  projectTitle: string;
  projectSlug: string;
};

export type PaidProjectOption = {
  id: string;
  title: string;
  slug: string;
  priceCents: number | null;
  currency: string;
};

export type AdminAuditRow = PurchaseAuditRecord;

export const ORDERS_PER_PAGE = 50;

/** A page of checkout attempts and manual grants, newest first. */
export async function listOrders({
  status,
  page = 0,
}: {
  status?: PurchaseStatus;
  page?: number;
} = {}): Promise<AdminOrderRow[]> {
  const rows = await withRetry(() =>
    db
      .select({
        purchase: purchases,
        buyerEmail: users.email,
        buyerName: users.name,
        projectTitle: projects.title,
        projectSlug: projects.slug,
      })
      .from(purchases)
      .innerJoin(users, eq(purchases.userId, users.id))
      .innerJoin(projects, eq(purchases.projectId, projects.id))
      .where(status ? eq(purchases.status, status) : undefined)
      .orderBy(desc(purchases.createdAt))
      .limit(ORDERS_PER_PAGE)
      .offset(Math.max(0, page) * ORDERS_PER_PAGE),
  );

  return rows.map((row) => ({
    ...row.purchase,
    buyerEmail: row.buyerEmail,
    buyerName: row.buyerName,
    projectTitle: row.projectTitle,
    projectSlug: row.projectSlug,
  }));
}

export async function countOrders({
  status,
}: {
  status?: PurchaseStatus;
} = {}): Promise<number> {
  const rows = await withRetry(() =>
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(purchases)
      .where(status ? eq(purchases.status, status) : undefined),
  );
  return rows[0]?.value ?? 0;
}

export async function listAuditTrail(limit = 20): Promise<AdminAuditRow[]> {
  return withRetry(() =>
    db
      .select()
      .from(purchaseAuditLog)
      .orderBy(desc(purchaseAuditLog.createdAt))
      .limit(limit),
  );
}

export async function listPaidProjects(): Promise<PaidProjectOption[]> {
  return withRetry(() =>
    db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        priceCents: projects.priceCents,
        currency: projects.currency,
      })
      .from(projects)
      .where(and(eq(projects.isPaid, true), eq(projects.status, "published")))
      .orderBy(projects.title),
  );
}

export const dbAdminStore: AdminAccessStore = {
  getProjectById: (id) => dbStore.getProjectById(id),
  findUserByEmail: async (email) => {
    const rows = await withRetry(() =>
      db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.email, email))
        .limit(1),
    );
    return rows[0] ?? null;
  },
  findUserById: async (id) => {
    const rows = await withRetry(() =>
      db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, id)).limit(1),
    );
    return rows[0] ?? null;
  },
  findPurchaseById: async (id) => {
    const rows = await withRetry(() =>
      db.select().from(purchases).where(eq(purchases.id, id)).limit(1),
    );
    return rows[0] ?? null;
  },
  findEntitlement: (userId, projectId) => dbStore.findEntitlement(userId, projectId),
  createPurchase: (input) => dbStore.createPurchase(input),
  updatePurchase: (id, patch) => dbStore.updatePurchase(id, patch),
  recordAudit: async (entry) => {
    await withRetry(() => db.insert(purchaseAuditLog).values(entry));
  },
};
