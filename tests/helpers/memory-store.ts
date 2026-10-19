import type { PurchaseRecord } from "@/lib/db/schema";
import type {
  CheckoutProject,
  NewPurchase,
  PaymentStore,
  PurchaseWithProject,
} from "@/lib/payments/store";

export function seedProject(overrides: Partial<CheckoutProject> = {}): CheckoutProject {
  return {
    id: "project_1",
    slug: "paid-project",
    title: "Paid Project",
    isPaid: true,
    status: "published",
    priceCents: 4900,
    currency: "USD",
    providerProductId: "product_123",
    liveUrl: "https://app.example.com",
    deliveryNote: "License key: TEST-1234",
    ...overrides,
  };
}

export function createMemoryStore({
  projects = [seedProject()],
  users = ["user_1"],
}: {
  projects?: CheckoutProject[];
  users?: string[];
} = {}) {
  const projectMap = new Map(projects.map((project) => [project.slug, project]));
  const purchases = new Map<string, PurchaseRecord>();
  const events = new Set<string>();
  const userIds = new Set(users);
  let counter = 0;

  const store: PaymentStore = {
    async getProjectBySlug(slug) {
      return projectMap.get(slug) ?? null;
    },
    async getProjectById(id) {
      return projects.find((project) => project.id === id) ?? null;
    },
    async userExists(id) {
      return userIds.has(id);
    },
    async createPurchase(input: NewPurchase) {
      const existing = [...purchases.values()].find(
        (purchase) => purchase.reference === input.reference,
      );
      if (existing) return existing;

      counter += 1;
      const now = new Date();
      const purchase: PurchaseRecord = {
        id: `purchase_${counter}`,
        ...input,
        createdAt: now,
        updatedAt: now,
      };
      purchases.set(purchase.id, purchase);
      return purchase;
    },
    async updatePurchase(id, patch) {
      const purchase = purchases.get(id);
      if (!purchase) return;
      purchases.set(id, { ...purchase, ...patch, updatedAt: new Date() });
    },
    async findPurchaseByReference(reference) {
      return [...purchases.values()].find((purchase) => purchase.reference === reference) ?? null;
    },
    async findPurchaseByOrder(provider, orderId) {
      return (
        [...purchases.values()].find(
          (purchase) =>
            purchase.provider === provider && purchase.providerOrderId === orderId,
        ) ?? null
      );
    },
    async recordWebhookEvent({ provider, eventId }) {
      const key = `${provider}:${eventId}`;
      if (events.has(key)) return false;
      events.add(key);
      return true;
    },
    async findEntitlement(userId, projectId) {
      const matches = [...purchases.values()]
        .filter(
          (purchase) =>
            purchase.userId === userId && purchase.projectId === projectId,
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return matches[0] ?? null;
    },
    async listPurchases(userId): Promise<PurchaseWithProject[]> {
      return [...purchases.values()]
        .filter((purchase) => purchase.userId === userId)
        .map((purchase) => {
          const project = projects.find((entry) => entry.id === purchase.projectId);
          return {
            ...purchase,
            projectTitle: project?.title ?? "Unknown",
            projectSlug: project?.slug ?? "",
          };
        });
    },
    async commerceStats() {
      const paid = [...purchases.values()].filter((purchase) => purchase.status === "paid");
      const revenue = new Map<string, number>();
      for (const purchase of paid) {
        revenue.set(
          purchase.currency,
          (revenue.get(purchase.currency) ?? 0) + purchase.amountCents,
        );
      }
      return {
        signups: userIds.size,
        paidOrders: paid.length,
        revenue: [...revenue.entries()].map(([currency, cents]) => ({ currency, cents })),
      };
    },
  };

  return { store, purchases, events, projects: projectMap };
}
