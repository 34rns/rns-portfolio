import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { accentInk, contrastRatio, defaultSiteSettings, onAccent, siteSettingsSchema } from "@/lib/site-settings/config";
import { readSiteState, writeSiteState } from "@/lib/site-settings/store";

let directory: string | undefined;
afterEach(async () => {
  vi.unstubAllEnvs();
  if (directory) await rm(directory, { recursive: true, force: true });
  directory = undefined;
});
async function local() {
  directory = await mkdtemp(join(tmpdir(), "rns-site-settings-"));
  vi.stubEnv("SITE_SETTINGS_DRIVER", "local");
  vi.stubEnv("SITE_SETTINGS_DIR", directory);
}

describe("site settings", () => {
  it("rejects unsafe URLs, CSS and unbounded motion", () => {
    for (const patch of [{ contactUrl: "javascript:alert(1)" }, { logoUrl: "//evil.test/a.png" }, { accent: "red;display:none" }, { motionIntensity: 5 }]) {
      expect(siteSettingsSchema.safeParse({ ...defaultSiteSettings, ...patch }).success).toBe(false);
    }
    expect(siteSettingsSchema.safeParse({ ...defaultSiteSettings, contactUrl: "mailto:hello@example.com" }).success).toBe(true);
  });
  it("uses contrasting text on light and dark accents", () => {
    expect(onAccent("#FFC900")).toBe("#000000");
    expect(onAccent("#071932")).toBe("#FFFFFF");
  });
  it("keeps editable accent text readable on both surfaces", () => {
    for (const hex of ["#FFC900", "#B8EF63", "#000000", "#FFFFFF", "#1B3BFF"]) {
      expect(contrastRatio(accentInk(hex, "paper"), "#eeefe8")).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(accentInk(hex, "night"), "#101214")).toBeGreaterThanOrEqual(4.5);
    }
    expect(accentInk("#FFC900", "night").toUpperCase()).toBe("#FFC900");
  });
  it("refuses to overwrite corrupt local settings", async () => {
    await local();
    const file = join(directory!, "site-settings.json");
    await writeFile(file, "{broken");
    expect((await readSiteState()).ready).toBe(false);
    await expect(writeSiteState(defaultSiteSettings, 0, "draft")).rejects.toThrow("could not be read");
    expect(await readFile(file, "utf8")).toBe("{broken");
  });
  it("persists a draft without changing the public settings, then publishes", async () => {
    await local();
    const initial = await readSiteState();
    const draft = { ...defaultSiteSettings, name: "Changed locally" };
    const saved = await writeSiteState(draft, initial.revision, "draft");
    expect((await readSiteState()).published.name).toBe("RNS");
    expect(JSON.parse(await readFile(join(directory!, "site-settings.json"), "utf8")).draft.name).toBe("Changed locally");
    const published = await writeSiteState(draft, saved.revision, "publish");
    expect(published.published.name).toBe("Changed locally");
    expect(published.publishedAt).toBeTruthy();
  });
  it("rejects a stale save so two tabs cannot overwrite each other", async () => {
    await local();
    await writeSiteState(defaultSiteSettings, 0, "draft");
    await expect(writeSiteState({ ...defaultSiteSettings, name: "Stale" }, 0, "publish")).rejects.toThrow("another tab");
    expect((await readSiteState()).draft.name).toBe("RNS");
  });
  it("serializes concurrent local saves and accepts only the current revision", async () => {
    await local();
    const results = await Promise.allSettled([
      writeSiteState({ ...defaultSiteSettings, name: "First" }, 0, "draft"),
      writeSiteState({ ...defaultSiteSettings, name: "Second" }, 0, "draft"),
    ]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    expect((await readSiteState()).revision).toBe(1);
  });
});
