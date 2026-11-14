import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { defaultSiteSettings, siteSettingsSchema, type SiteSettings } from "./config";

export type SiteState = {
  draft: SiteSettings;
  published: SiteSettings;
  revision: number;
  updatedAt: string | null;
  publishedAt: string | null;
  ready: boolean;
  error?: string;
};
export const emptySiteState = (): SiteState => ({
  draft: structuredClone(defaultSiteSettings), published: structuredClone(defaultSiteSettings),
  revision: 0, updatedAt: null, publishedAt: null, ready: true,
});
export function siteSettingsDriver() {
  const driver = process.env.SITE_SETTINGS_DRIVER || (process.env.NODE_ENV === "production" ? "database" : "local");
  if (driver !== "local" && driver !== "database") throw new Error("Unknown site settings storage driver.");
  return driver;
}
function filename() {
  const configured = process.env.SITE_SETTINGS_DIR ?? ".local";
  const root = path.resolve(/* turbopackIgnore: true */ configured);
  return path.join(root, "site-settings.json");
}
export async function readSiteState(): Promise<SiteState> {
  if (siteSettingsDriver() === "database") return (await import("./database")).readDatabaseSiteState();
  try {
    const value = JSON.parse(await readFile(/* turbopackIgnore: true */ filename(), "utf8")) as SiteState;
    if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error("Invalid settings revision.");
    return { ...value, draft: siteSettingsSchema.parse(value.draft), published: siteSettingsSchema.parse(value.published), ready: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptySiteState();
    return { ...emptySiteState(), ready: false, error: "Saved site settings could not be read. Restore the settings file before saving." };
  }
}

// Local development runs in one process; production uses Postgres revision checks.
let queue: Promise<unknown> = Promise.resolve();
export async function writeSiteState(settings: SiteSettings, revision: number, intent: "draft" | "publish"): Promise<SiteState> {
  const validated = siteSettingsSchema.parse(settings);
  if (siteSettingsDriver() === "database") return (await import("./database")).writeDatabaseSiteState(validated, revision, intent);
  const operation = queue.then(async () => {
    const current = await readSiteState();
    if (!current.ready) throw new Error(current.error);
    if (current.revision !== revision) throw new Error("Settings changed in another tab. Reload before saving.");
    const now = new Date().toISOString();
    const next = { ...current, draft: validated, published: intent === "publish" ? validated : current.published,
      revision: revision + 1, updatedAt: now, publishedAt: intent === "publish" ? now : current.publishedAt };
    const target = filename();
    const temporary = target + "." + randomUUID() + ".tmp";
    await mkdir(path.dirname(target), { recursive: true });
    try {
      await writeFile(/* turbopackIgnore: true */ temporary, JSON.stringify(next, null, 2), { flag: "wx" });
      await rename(/* turbopackIgnore: true */ temporary, /* turbopackIgnore: true */ target);
    } finally { await unlink(/* turbopackIgnore: true */ temporary).catch(() => {}); }
    return next;
  });
  queue = operation.catch(() => {});
  return operation;
}
