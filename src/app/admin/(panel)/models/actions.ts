"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { dbModelStore } from "@/lib/models/db-store";
import { removeModel } from "@/lib/models/service";
import { cleanModelName } from "@/lib/models/validate";
import { revalidateProject } from "@/lib/projects/revalidate";

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

  const result = await removeModel(dbModelStore, { id, force });

  if (!result.ok) {
    if (result.needsConfirmation) back({ delete: id });
    back({ error: result.error });
  }

  for (const slug of result.slugs) revalidateProject(slug);
  revalidatePath("/admin/models");

  back({
    notice: result.detached
      ? `Model deleted and removed from ${result.detached} project(s).`
      : "Model deleted.",
  });
}
