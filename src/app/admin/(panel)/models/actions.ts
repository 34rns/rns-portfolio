"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { dbModelStore } from "@/lib/models/db-store";
import { describeUsage } from "@/lib/models/store";
import { cleanModelName } from "@/lib/models/validate";
import { revalidateProject } from "@/lib/projects/revalidate";
import { deleteStoredFile } from "@/lib/uploads/storage";

function back(params: Record<string, string>): never {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  redirect(`/admin/models${query ? `?${query}` : ""}`);
}

export async function renameModelAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("modelId") ?? "");
  const model = await dbModelStore.findModel(id);
  if (!model) back({ error: "That model no longer exists." });

  const name = cleanModelName(formData.get("name"), model.name);
  await dbModelStore.updateModel(model.id, { name });

  revalidatePath("/admin/models");
  back({ notice: "Model renamed." });
}

/**
 * Deleting a file that a project still shows asks first: the usage list is
 * rendered on the page and the operator confirms with `force`. Confirming
 * detaches the model from those projects, which puts them back on their cover
 * image rather than leaving a broken stage.
 */
export async function deleteModelAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("modelId") ?? "");
  const force = formData.get("force") === "on";

  const model = await dbModelStore.findModel(id);
  if (!model) back({ error: "That model no longer exists." });

  const usage = describeUsage(await dbModelStore.listModelUsage(), model.url);
  if (usage.length > 0 && !force) {
    back({ delete: model.id });
  }

  const slugs = usage.map((entry) => entry.projectSlug);
  const detached = await dbModelStore.clearModelUrl(model.url);
  await dbModelStore.deleteModel(model.id);

  try {
    await deleteStoredFile(model.url);
  } catch (error) {
    console.error("model file cleanup failed", error);
  }

  for (const slug of new Set(slugs)) revalidateProject(slug);
  revalidatePath("/admin/models");

  back({
    notice: detached
      ? `Model deleted and removed from ${detached} project(s).`
      : "Model deleted.",
  });
}
