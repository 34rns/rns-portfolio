"use server";

import { redirect } from "next/navigation";
import { purchaseStatus } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { grantAccess, revokeAccess } from "@/lib/payments/admin";
import { dbAdminStore } from "@/lib/payments/db-admin";

const statuses = purchaseStatus.enumValues as readonly string[];

function statusFilter(formData: FormData): string {
  const value = String(formData.get("status") ?? "");
  return statuses.includes(value) ? value : "";
}

function back(params: Record<string, string>): never {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  redirect(`/admin/orders${query ? `?${query}` : ""}`);
}

export async function grantAccessAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const status = statusFilter(formData);
  const page = String(formData.get("page") ?? "");

  const result = await grantAccess(dbAdminStore, {
    projectId: String(formData.get("projectId") ?? ""),
    email: String(formData.get("email") ?? ""),
    actorEmail: admin.email ?? "admin",
    reason: String(formData.get("reason") ?? ""),
  });

  if (!result.ok) {
    back({ status, page, error: result.error });
  }

  back({
    status,
    page,
    notice: result.changed
      ? "Access granted and recorded in the audit trail."
      : "That buyer already has access to this project.",
  });
}

export async function revokeAccessAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const status = statusFilter(formData);
  const page = String(formData.get("page") ?? "");

  const result = await revokeAccess(dbAdminStore, {
    purchaseId: String(formData.get("purchaseId") ?? ""),
    actorEmail: admin.email ?? "admin",
    reason: String(formData.get("reason") ?? ""),
  });

  if (!result.ok) {
    back({ status, page, error: result.error });
  }

  back({ status, page, notice: "Access revoked and recorded in the audit trail." });
}
