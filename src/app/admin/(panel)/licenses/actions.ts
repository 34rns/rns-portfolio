"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createLicenseForAdmin,
  extendLicense,
  resetLicenseDevices,
  revokeLicense,
} from "@/lib/licensing/admin";
import { dbLicenseStore } from "@/lib/licensing/db-store";
import { isLicenseType } from "@/lib/licensing/store";

function back(params: Record<string, string>): never {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  redirect(`/admin/licenses${query ? `?${query}` : ""}`);
}

function filters(formData: FormData) {
  return {
    status: String(formData.get("filterStatus") ?? ""),
    q: String(formData.get("filterQuery") ?? ""),
    page: String(formData.get("filterPage") ?? ""),
  };
}

function licenseId(formData: FormData): string {
  return String(formData.get("licenseId") ?? "");
}

export async function createLicenseAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const state = filters(formData);

  const type = String(formData.get("licenseType") ?? "permanent");
  if (!isLicenseType(type)) back({ ...state, error: "Unknown license type." });

  const projectSlugs = formData
    .getAll("projectSlugs")
    .map((value) => String(value))
    .filter(Boolean);

  const days = Number.parseInt(String(formData.get("days") ?? ""), 10);
  const maxDevices = Number.parseInt(String(formData.get("maxDevices") ?? "2"), 10);
  const activateByValue = String(formData.get("activateBy") ?? "").trim();
  const activateBy = activateByValue ? new Date(`${activateByValue}T23:59:59Z`) : null;

  const result = await createLicenseForAdmin(dbLicenseStore, {
    projectSlugs,
    type,
    days: Number.isFinite(days) ? days : null,
    activateBy: activateBy && !Number.isNaN(activateBy.getTime()) ? activateBy : null,
    maxDevices: Number.isFinite(maxDevices) ? maxDevices : undefined,
    note: String(formData.get("note") ?? ""),
    actorEmail: admin.email ?? "admin",
  });

  if (!result.ok) back({ ...state, error: result.error });
  redirect(`/admin/licenses?reveal=${result.license.id}`);
}

export async function revokeLicenseAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const state = filters(formData);
  const revoked = String(formData.get("revoked") ?? "") !== "false";

  const result = await revokeLicense(dbLicenseStore, {
    id: licenseId(formData),
    actorEmail: admin.email ?? "admin",
    reason: String(formData.get("reason") ?? ""),
    revoked,
  });

  if (!result.ok) back({ ...state, error: result.error });
  back({
    ...state,
    notice: revoked ? "Key revoked." : "Key un-revoked. It verifies again.",
  });
}

export async function extendLicenseAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const state = filters(formData);
  const days = Number.parseInt(String(formData.get("days") ?? ""), 10);

  const result = await extendLicense(dbLicenseStore, {
    id: licenseId(formData),
    days,
    actorEmail: admin.email ?? "admin",
  });

  if (!result.ok) back({ ...state, error: result.error });
  back({ ...state, notice: `Extended by ${days} day(s).` });
}

export async function resetDevicesAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const state = filters(formData);

  const result = await resetLicenseDevices(dbLicenseStore, {
    id: licenseId(formData),
    actorEmail: admin.email ?? "admin",
  });

  if (!result.ok) back({ ...state, error: result.error });
  back({ ...state, notice: "Device slots released. The activation clock was not reset." });
}
