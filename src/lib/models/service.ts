import { deleteStoredFile } from "@/lib/uploads/storage";
import { describeUsage, type ModelStore, type ModelUsage } from "./store";

export type ReplaceResult =
  | { ok: true; reassigned: number }
  | { ok: false; status: 400 | 404; error: string };

/**
 * Moves a library entry onto a newly uploaded file.
 *
 * The order is deliberate: the row moves, every project that pointed at the old
 * URL is rewritten, and only then does the old file go. A failure part way
 * through leaves a file nobody references, never a project pointing at one that
 * has been deleted.
 */
export async function replaceModelFile(
  store: ModelStore,
  {
    id,
    url,
    size,
    removeFile = deleteStoredFile,
  }: {
    id: string;
    url: string;
    size: number | null;
    removeFile?: (url: string) => Promise<void>;
  },
): Promise<ReplaceResult> {
  const model = await store.findModel(id);
  if (!model) return { ok: false, status: 404, error: "That model no longer exists." };

  const oldUrl = model.url;
  await store.updateModel(model.id, { url, size });

  if (oldUrl === url) return { ok: true, reassigned: 0 };

  const reassigned = await store.reassignModelUrl(oldUrl, url);

  try {
    await removeFile(oldUrl);
  } catch (error) {
    // The swap already succeeded; a leftover file is a cleanup problem, not a
    // broken site.
    console.error("model file cleanup failed", error);
  }

  return { ok: true, reassigned };
}

export type RemoveResult =
  | { ok: true; detached: number; slugs: string[]; usage: ModelUsage[] }
  | { ok: false; needsConfirmation: true; usage: ModelUsage[] }
  | { ok: false; needsConfirmation: false; status: 404; error: string };

/**
 * Deletes a model row and its stored file. A file that a project still shows
 * stops and asks first: without `force` the caller gets the list to show, and
 * confirming detaches those projects so they fall back to their cover image.
 */
export async function removeModel(
  store: ModelStore,
  {
    id,
    force = false,
    removeFile = deleteStoredFile,
  }: {
    id: string;
    force?: boolean;
    removeFile?: (url: string) => Promise<void>;
  },
): Promise<RemoveResult> {
  const model = await store.findModel(id);
  if (!model) {
    return {
      ok: false,
      needsConfirmation: false,
      status: 404,
      error: "That model no longer exists.",
    };
  }

  const usage = describeUsage(await store.listModelUsage(), model.url);
  if (usage.length > 0 && !force) {
    return { ok: false, needsConfirmation: true, usage };
  }

  const slugs = [...new Set(usage.map((entry) => entry.projectSlug))];
  const detached = await store.clearModelUrl(model.url);
  await store.deleteModel(model.id);

  try {
    await removeFile(model.url);
  } catch (error) {
    console.error("model file cleanup failed", error);
  }

  return { ok: true, detached, slugs, usage };
}
