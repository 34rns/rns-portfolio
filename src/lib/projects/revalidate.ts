import { revalidatePath } from "next/cache";

/**
 * Every mutation funnels through here. Pages stay static; this invalidates the
 * cached route so the next request regenerates it from the database.
 */
export function revalidateProject(slug: string, previousSlug?: string): void {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/projects/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/projects/${previousSlug}`);
  }
}
