import type { PurchaseRecord, PurchaseStatus } from "@/lib/db/schema";

export type CheckoutProject = {
  id: string;
  slug: string;
  title: string;
  isPaid: boolean;
  status: "draft" | "published";
  priceCents: number | null;
  currency: string;
  providerProductId: string | null;
  liveUrl: string | null;
  deliveryNote: string | null;
};

export type PurchaseWithProject = PurchaseRecord & {
  projectTitle: string;
  projectSlug: string;
};

export type NewPurchase = {
  reference: string;
  userId: string;
  projectId: string;
  provider: string;
  providerOrderId: string | null;
  status: PurchaseStatus;
  amountCents: number;
  currency: string;
};

export type CommerceStats = {
  signups: number;
  paidOrders: number;
  /** One entry per currency; totals are never mixed across currencies. */
  revenue: { currency: string; cents: number }[];
};

/**
 * Persistence seam for payments. The webhook engine only talks to this
 * interface, so its idempotency and gating rules can be tested against an
 * in-memory store without a database.
 */
export interface PaymentStore {
  getProjectBySlug(slug: string): Promise<CheckoutProject | null>;
  getProjectById(id: string): Promise<CheckoutProject | null>;
  userExists(id: string): Promise<boolean>;
  createPurchase(input: NewPurchase): Promise<PurchaseRecord>;
  updatePurchase(
    id: string,
    patch: {
      status: PurchaseStatus;
      providerOrderId?: string | null;
      amountCents?: number;
      currency?: string;
    },
  ): Promise<void>;
  findPurchaseByReference(reference: string): Promise<PurchaseRecord | null>;
  findPurchaseByOrder(provider: string, orderId: string): Promise<PurchaseRecord | null>;
  recordWebhookEvent(input: {
    provider: string;
    eventId: string;
    type: string;
  }): Promise<boolean>;
  findEntitlement(userId: string, projectId: string): Promise<PurchaseRecord | null>;
  listPurchases(userId: string): Promise<PurchaseWithProject[]>;
  commerceStats(): Promise<CommerceStats>;
}
