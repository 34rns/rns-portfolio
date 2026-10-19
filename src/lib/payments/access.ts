import type { PurchaseRecord } from "@/lib/db/schema";

export type EntitlementProject = {
  isPaid: boolean;
  liveUrl: string | null;
  deliveryNote: string | null;
};

export type Entitlement = {
  authenticated: boolean;
  purchased: boolean;
  isPaid: boolean;
  liveUrl: string | null;
  deliveryNote: string | null;
};

/**
 * Single rule for unlocking buyer-only content. Paid projects reveal the live
 * URL and delivery note only with a `paid` purchase; an unpaid or refunded row
 * must never leak them.
 */
export function isEntitled(purchase: Pick<PurchaseRecord, "status"> | null): boolean {
  return purchase?.status === "paid";
}

export function buildEntitlement({
  project,
  purchase,
  authenticated,
}: {
  project: EntitlementProject;
  purchase: Pick<PurchaseRecord, "status"> | null;
  authenticated: boolean;
}): Entitlement {
  const purchased = project.isPaid ? isEntitled(purchase) : false;

  return {
    authenticated,
    purchased,
    isPaid: project.isPaid,
    liveUrl: purchased ? project.liveUrl : null,
    deliveryNote: purchased ? project.deliveryNote : null,
  };
}
