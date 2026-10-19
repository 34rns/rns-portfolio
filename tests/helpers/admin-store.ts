import type { PurchaseRecord } from "@/lib/db/schema";
import type { AdminAccessStore, AdminBuyer, NewAuditEntry } from "@/lib/payments/admin";
import type { CheckoutProject, NewPurchase } from "@/lib/payments/store";
import { seedProject } from "./memory-store";

/**
 * In-memory stand-in for the admin store. Timestamps step forward on every
 * write so "latest purchase wins" ordering is deterministic.
 */
export function createMemoryAdminStore({
  projects = [seedProject()],
  buyers = [{ id: "user_1", email: "buyer@example.com" }],
  purchases = [],
}: {
  projects?: CheckoutProject[];
  buyers?: AdminBuyer[];
  purchases?: PurchaseRecord[];
} = {}) {
  const purchaseRows = new Map(purchases.map((purchase) => [purchase.id, purchase]));
  const audits: NewAuditEntry[] = [];
  let counter = 0;

  const nextTimestamp = () => new Date(1_700_000_000_000 + counter * 1000);

  const store: AdminAccessStore = {
    async getProjectById(id) {
      return projects.find((project) => project.id === id) ?? null;
    },
    async findUserByEmail(email) {
      return buyers.find((buyer) => buyer.email === email) ?? null;
    },
    async findUserById(id) {
      return buyers.find((buyer) => buyer.id === id) ?? null;
    },
    async findPurchaseById(id) {
      return purchaseRows.get(id) ?? null;
    },
    async findEntitlement(userId, projectId) {
      return (
        [...purchaseRows.values()]
          .filter(
            (purchase) =>
              purchase.userId === userId && purchase.projectId === projectId,
          )
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
      );
    },
    async createPurchase(input: NewPurchase) {
      counter += 1;
      const now = nextTimestamp();
      const purchase: PurchaseRecord = {
        id: `purchase_${counter}`,
        ...input,
        createdAt: now,
        updatedAt: now,
      };
      purchaseRows.set(purchase.id, purchase);
      return purchase;
    },
    async updatePurchase(id, patch) {
      const purchase = purchaseRows.get(id);
      if (!purchase) return;
      counter += 1;
      purchaseRows.set(id, {
        ...purchase,
        ...patch,
        updatedAt: nextTimestamp(),
      });
    },
    async recordAudit(entry) {
      audits.push(entry);
    },
  };

  return { store, purchases: purchaseRows, audits };
}

export function seedPurchase(overrides: Partial<PurchaseRecord> = {}): PurchaseRecord {
  const now = new Date(1_700_000_000_000);
  return {
    id: "purchase_seeded",
    reference: "chk_seeded",
    userId: "user_1",
    projectId: "project_1",
    provider: "mock",
    providerOrderId: "order_seeded",
    status: "pending",
    amountCents: 4900,
    currency: "USD",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
