import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { siteSettingsSchema, type SiteSettings } from "./config";
import { emptySiteState, type SiteState } from "./store";

function toState(row: typeof siteSettings.$inferSelect): SiteState {
  return { draft: siteSettingsSchema.parse(row.draft), published: siteSettingsSchema.parse(row.published),
    revision: row.revision, updatedAt: row.updatedAt.toISOString(), publishedAt: row.publishedAt?.toISOString() ?? null, ready: true };
}
export async function readDatabaseSiteState(): Promise<SiteState> {
  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, "portfolio")).limit(1);
    return row ? toState(row) : emptySiteState();
  } catch {
    return { ...emptySiteState(), ready: false, error: "Site settings storage is unavailable. Check the database connection and apply the site settings migration before saving." };
  }
}
export async function writeDatabaseSiteState(settings: SiteSettings, revision: number, intent: "draft" | "publish"): Promise<SiteState> {
  const current = await readDatabaseSiteState();
  if (!current.ready) throw new Error(current.error);
  if (current.revision !== revision) throw new Error("Settings changed in another tab. Reload before saving.");
  const now = new Date();
  const value = { draft: settings, published: intent === "publish" ? settings : current.published,
    revision: revision + 1, updatedAt: now, publishedAt: intent === "publish" ? now : current.publishedAt ? new Date(current.publishedAt) : null };
  const rows = revision === 0
    ? await db.insert(siteSettings).values({ id: "portfolio", ...value }).onConflictDoNothing().returning()
    : await db.update(siteSettings).set(value).where(and(eq(siteSettings.id, "portfolio"), eq(siteSettings.revision, revision))).returning();
  if (!rows[0]) throw new Error("Settings changed in another tab. Reload before saving.");
  return toState(rows[0]);
}
