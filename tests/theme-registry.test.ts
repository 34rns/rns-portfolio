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
});
