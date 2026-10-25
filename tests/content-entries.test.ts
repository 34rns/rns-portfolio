import { describe, expect, it } from "vitest";
import {
  planContentInsertions,
  projectEntries,
  QUICKKIT_DOWNLOAD,
} from "@/lib/projects/content";
import { isReleaseDownloadLink, repoSlug } from "@/lib/projects/links";

type Row = { id: string; slug: string; title: string };

const row = (slug: string): Row => ({ id: `id-${slug}`, slug, title: slug });

describe("planContentInsertions", () => {
  it("inserts both entries when neither slug exists", () => {
    const plan = planContentInsertions([row("moneykick-shop")]);

    expect(plan.toInsert.map((entry) => entry.slug)).toEqual(["loupe", "quickkit"]);
    expect(plan.skipped).toEqual([]);
  });

  it("skips any slug that already exists and never rewrites it", () => {
    const plan = planContentInsertions([row("loupe"), row("office-chaos")]);

    expect(plan.toInsert.map((entry) => entry.slug)).toEqual(["quickkit"]);
    expect(plan.skipped.map((entry) => entry.slug)).toEqual(["loupe"]);
  });

  it("has no update or delete path at all", () => {
    const plan = planContentInsertions([row("loupe"), row("quickkit")]);

    expect(plan.toInsert).toEqual([]);
    expect(plan.skipped).toHaveLength(2);
    // The plan only ever carries two kinds of decision.
    expect(Object.keys(plan).sort()).toEqual(["skipped", "toInsert"]);
  });

  it("is a no-op when re-run after a successful insert", () => {
    const first = planContentInsertions([]);
    const afterFirstRun = [row("loupe"), row("quickkit")];
    const second = planContentInsertions(afterFirstRun);

    expect(first.toInsert).toHaveLength(2);
    expect(second.toInsert).toHaveLength(0);
    expect(second.skipped).toHaveLength(2);
  });
});

describe("project entries", () => {
  it("uses unique slugs that do not collide with the seeded ones", () => {
    const slugs = projectEntries.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual(["loupe", "quickkit"]);
  });

  it("publishes each project as free, with a repo and a cover", () => {
    for (const entry of projectEntries) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.tagline.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(200);
      expect(entry.tags.length).toBeGreaterThanOrEqual(3);
      expect(entry.repoUrl).toMatch(/^https:\/\/github\.com\//);
      expect(entry.defaultImages.cover).toBeTruthy();
      expect(entry.defaultImages.gallery.length).toBeGreaterThanOrEqual(2);
      expect(entry.liveUrl).toBeTruthy();
      expect(entry.sortOrder).toBeGreaterThan(0);
    }
  });

  it("points the download link at a stable GitHub latest URL for its own repo", () => {
    for (const entry of projectEntries) {
      expect(isReleaseDownloadLink(entry.liveUrl)).toBe(true);
      expect(entry.liveUrl).toContain(repoSlug(entry.repoUrl) ?? "missing");
    }
    expect(QUICKKIT_DOWNLOAD).toBe(
      "https://github.com/34rns/QuickKit/releases/latest/download/quickkit.zip",
    );
  });
});

describe("release download links", () => {
  it("recognises a GitHub latest download URL", () => {
    expect(isReleaseDownloadLink(QUICKKIT_DOWNLOAD)).toBe(true);
    expect(
      isReleaseDownloadLink("https://github.com/a/b/releases/latest/download/x.zip"),
    ).toBe(true);
  });

  it("does not treat a site or a version-pinned asset as the stable link", () => {
    expect(isReleaseDownloadLink("https://moneykickshop1.vercel.app")).toBe(false);
    expect(isReleaseDownloadLink("https://github.com/34rns/loupe")).toBe(false);
    expect(isReleaseDownloadLink("https://github.com/a/b/releases/download/v1/x.zip")).toBe(
      false,
    );
    expect(isReleaseDownloadLink(null)).toBe(false);
    expect(isReleaseDownloadLink(undefined)).toBe(false);
  });
});

describe("repoSlug", () => {
  it("extracts owner and repo from a GitHub URL", () => {
    expect(repoSlug("https://github.com/34rns/loupe")).toBe("34rns/loupe");
    expect(repoSlug("https://github.com/34rns/QuickKit/")).toBe("34rns/QuickKit");
    expect(repoSlug("https://github.com/34rns")).toBeNull();
  });

  it("refuses anything that is not GitHub", () => {
    expect(repoSlug("https://gitlab.com/a/b")).toBeNull();
    expect(repoSlug("not a url")).toBeNull();
    expect(repoSlug(null)).toBeNull();
  });
});
