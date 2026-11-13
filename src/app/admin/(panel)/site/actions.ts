"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { siteSettingsSchema, type SiteSettings } from "@/lib/site-settings/config";
import { writeSiteState } from "@/lib/site-settings/store";

export type SiteFormState = { error?: string; message?: string; revision?: number; settings?: SiteSettings };
export async function saveSiteSettings(_previous: SiteFormState, form: FormData): Promise<SiteFormState> {
  await requireAdmin();
  const fail = (error: string): SiteFormState => ({ ..._previous, message: undefined, error });
  const raw = form.get("settings");
  const version = form.get("revision");
  const intent = form.get("intent");
  if (typeof raw !== "string" || raw.length > 20000 || typeof version !== "string" || !/^\d+$/.test(version) || !Number.isSafeInteger(Number(version)) || (intent !== "draft" && intent !== "publish")) return fail("Invalid save request. Reload the editor and try again.");
  let settings: SiteSettings;
  try { settings = siteSettingsSchema.parse(JSON.parse(raw)); }
  catch { return fail("Check your fields: text is required, links must be safe URLs, and the accent must be a six-digit hex color."); }
  try {
    const state = await writeSiteState(settings, Number(version), intent);
    revalidatePath("/admin/site");
    revalidatePath("/admin/site-preview");
    if (intent === "publish") revalidatePath("/");
    return { revision: state.revision, settings: state.draft, message: intent === "publish" ? "Published. The homepage now uses these settings." : "Draft saved. Open the full preview to review it." };
  } catch (error) { return fail(error instanceof Error ? error.message : "Could not save. Your edits are still in the editor."); }
}
