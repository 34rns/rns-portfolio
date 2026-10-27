"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createLicenseForAdmin } from "@/lib/licensing/admin";
import { dbLicenseStore } from "@/lib/licensing/db-store";
import { isLicenseType } from "@/lib/licensing/store";
import { dbOrderStore } from "@/lib/orders/db-store";
import {
  isOrderStatus,
  parseAmountToCents,
  updateOrder,
} from "@/lib/orders/service";

function back(params: Record<string, string>): never {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  redirect(`/admin/orders${query ? `?${query}` : ""}`);
}

function filters(formData: FormData) {
  return {
    status: String(formData.get("filterStatus") ?? ""),
    q: String(formData.get("filterQuery") ?? ""),
    page: String(formData.get("filterPage") ?? ""),
  };
}

export async function updateOrderAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const state = filters(formData);
  const id = String(formData.get("orderId") ?? "");

  const status = String(formData.get("status") ?? "");
  if (!isOrderStatus(status)) back({ ...state, error: "Unknown order status." });

  const amount = parseAmountToCents(String(formData.get("amount") ?? ""));
  if (amount === undefined) back({ ...state, error: "That amount is not a number." });

  const result = await updateOrder({
    store: dbOrderStore,
    id,
    status,
    notes: String(formData.get("notes") ?? ""),
    amountCents: amount,
    currency: String(formData.get("currency") ?? ""),
  });

  if (!result.ok) back({ ...state, error: result.error });
  back({ ...state, notice: "Order updated. The buyer's page shows the new status." });
}

export async function generateLicenseAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("orderId") ?? "");

  const order = await dbOrderStore.findOrderById(id);
  if (!order) back({ error: "That order no longer exists." });

  const project = await dbOrderStore.getProjectById(order.projectId);
  if (!project) back({ error: "That project no longer exists." });

  const existing = await dbLicenseStore.findLicenseByOrderId(order.id);
  if (existing) redirect(`/admin/licenses?reveal=${existing.id}`);

  const type = String(formData.get("licenseType") ?? "permanent");
  if (!isLicenseType(type)) back({ error: "Unknown license type." });

  const days = Number.parseInt(String(formData.get("days") ?? ""), 10);
  const maxDevices = Number.parseInt(String(formData.get("maxDevices") ?? "2"), 10);

  const result = await createLicenseForAdmin(dbLicenseStore, {
    projectSlugs: [project.slug],
    type,
    days: Number.isFinite(days) ? days : null,
    maxDevices: Number.isFinite(maxDevices) ? maxDevices : undefined,
    note: String(formData.get("note") ?? "") || `Order ${order.id.slice(0, 8)}`,
    orderId: order.id,
    actorEmail: admin.email ?? "admin",
  });

  if (!result.ok) back({ error: result.error });

  // The key is shown on the licenses page, never in a redirect URL where it
  // would end up in access logs.
  redirect(`/admin/licenses?reveal=${result.license.id}`);
}
