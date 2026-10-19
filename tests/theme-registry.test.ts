import { describe, expect, it } from "vitest";
import { defaultThemeSlug, getTheme, themeList, themes } from "@/themes/registry";

describe("theme registry", () => {
  it("resolves the professional theme", () => {
    expect(getTheme("professional").slug).toBe("professional");
  });

  it("falls back to the default theme for unknown slugs", () => {
    expect(getTheme("does-not-exist").slug).toBe(defaultThemeSlug);
  });

  it("registers a complete theme contract", () => {
    for (const theme of themeList) {
      expect(theme.ProjectPage).toBeTypeOf("function");
      expect(theme.Preview).toBeTypeOf("function");
      expect(theme.tokens.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.name.length).toBeGreaterThan(0);
    }
  });

  it("only the default theme owns the landing layout", () => {
    expect(themes[defaultThemeSlug].Landing).toBeTypeOf("function");
  });

  it("registers the Anime 3D theme for project pages", () => {
    expect(themes.anime.slug).toBe("anime");
    expect(themes.anime.ProjectPage).toBeTypeOf("function");
    expect(themes.anime.Landing).toBeUndefined();
    expect(getTheme("anime").slug).toBe("anime");
  });

  it("registers the Synthwave theme for project pages", () => {
    expect(themes.synthwave.slug).toBe("synthwave");
    expect(themes.synthwave.ProjectPage).toBeTypeOf("function");
    expect(themes.synthwave.Landing).toBeUndefined();
    expect(getTheme("synthwave").slug).toBe("synthwave");
  });

  it("registers the Cyberpunk theme for project pages", () => {
    expect(themes.cyberpunk.slug).toBe("cyberpunk");
    expect(themes.cyberpunk.ProjectPage).toBeTypeOf("function");
    expect(themes.cyberpunk.Landing).toBeUndefined();
    expect(getTheme("cyberpunk").slug).toBe("cyberpunk");
  });
});
