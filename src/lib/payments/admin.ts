import type { PurchaseRecord } from "@/lib/db/schema";
import type { CheckoutProject, NewPurchase } from "./store";

export type AdminBuyer = {
  id: string;
  email: string;
};

export type AuditAction = "grant" | "revoke";

export type NewAuditEntry = {
  purchaseId: string;
  projectId: string;
  buyerId: string;
  buyerEmail: string;
  projectTitle: string;
  actorEmail: string;
  action: AuditAction;
  reason: string | null;
  amountCents: number;
  currency: string;
};

/**
 * The small surface manual access changes need. Kept apart from PaymentStore so
 * the webhook engine never sees admin-only operations.
 */
export type AdminAccessStore = {
  getProjectById(id: string): Promise<CheckoutProject | null>;
  findUserByEmail(email: string): Promise<AdminBuyer | null>;
  findUserById(id: string): Promise<AdminBuyer | null>;
  findPurchaseById(id: string): Promise<PurchaseRecord | null>;
  findEntitlement(userId: string, projectId: string): Promise<PurchaseRecord | null>;
  createPurchase(input: NewPurchase): Promise<PurchaseRecord>;
  updatePurchase(
    id: string,
    patch: { status: PurchaseRecord["status"]; providerOrderId?: string | null },
  ): Promise<void>;
  recordAudit(entry: NewAuditEntry): Promise<void>;
};

export type AdminAccessResult =
  | { ok: true; purchase: PurchaseRecord; changed: boolean }
  | { ok: false; status: 400 | 404 | 409; error: string };

function cleanReason(reason: string | null | undefined): string | null {
  const trimmed = reason?.trim();
  return trimmed ? trimmed.slice(0, 500) : null;
}

/**
 * Comped access is a new $0 row with the `manual` provider rather than a
 * mutation of an earlier checkout. History stays honest: a failed or refunded
 * order is not rewritten to look like a provider payment.
 */
export async function grantAccess(
  store: AdminAccessStore,
  {
    projectId,
    email,
    actorEmail,
    reason,
    reference,
  }: {
    projectId: string;
    email: string;
    actorEmail: string;
    reason?: string | null;
    /** Injected by tests; production generates one. */
    reference?: string;
  },
): Promise<AdminAccessResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, status: 400, error: "Enter the buyer's email." };
  }

  const project = await store.getProjectById(projectId);
  if (!project) {
    return { ok: false, status: 404, error: "That project no longer exists." };
  }
  if (!project.isPaid) {
    return { ok: false, status: 400, error: "Free projects need no access grant." };
  }

  const buyer = await store.findUserByEmail(normalized);
  if (!buyer) {
    return { ok: false, status: 404, error: `No visitor account uses ${normalized}.` };
  }

  const existing = await store.findEntitlement(buyer.id, project.id);
  if (existing?.status === "paid") {
    return { ok: true, purchase: existing, changed: false };
  }

  const purchase = await store.createPurchase({
    reference: reference ?? `manual_${crypto.randomUUID()}`,
    userId: buyer.id,
    projectId: project.id,
    provider: "manual",
    providerOrderId: null,
    status: "paid",
    amountCents: 0,
    currency: project.currency,
  });

  await store.recordAudit({
    purchaseId: purchase.id,
    projectId: project.id,
    buyerId: buyer.id,
    buyerEmail: buyer.email,
    projectTitle: project.title,
    actorEmail,
    action: "grant",
    reason: cleanReason(reason),
    amountCents: purchase.amountCents,
    currency: purchase.currency,
  });

  return { ok: true, purchase, changed: true };
}

export async function revokeAccess(
  store: AdminAccessStore,
  {
    purchaseId,
    actorEmail,
    reason,
  }: {
    purchaseId: string;
    actorEmail: string;
    reason?: string | null;
  },
): Promise<AdminAccessResult> {
  const purchase = await store.findPurchaseById(purchaseId);
  if (!purchase) {
    return { ok: false, status: 404, error: "That order no longer exists." };
  }
  if (purchase.status !== "paid") {
    return {
      ok: false,
      status: 409,
      error: "That order is not active, so there is nothing to revoke.",
    };
  }

  const [project, buyer] = await Promise.all([
    store.getProjectById(purchase.projectId),
    store.findUserById(purchase.userId),
  ]);

  await store.updatePurchase(purchase.id, { status: "refunded" });

  await store.recordAudit({
    purchaseId: purchase.id,
    projectId: purchase.projectId,
    buyerId: purchase.userId,
    buyerEmail: buyer?.email ?? "unknown",
    projectTitle: project?.title ?? "Unknown project",
    actorEmail,
    action: "revoke",
    reason: cleanReason(reason),
    amountCents: purchase.amountCents,
    currency: purchase.currency,
  });

  return {
    ok: true,
    purchase: { ...purchase, status: "refunded", updatedAt: new Date() },
    changed: true,
  };
}
