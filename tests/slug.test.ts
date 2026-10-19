import { describe, expect, it } from "vitest";
import { ensureUniqueSlug, slugify } from "@/lib/projects/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("MoneyKick Shop")).toBe("moneykick-shop");
    expect(slugify("  RISE — Hunter's Ascent  ")).toBe("rise-hunter-s-ascent");
  });

  it("strips accents and symbols", () => {
    expect(slugify("Café Déjà Vu")).toBe("cafe-deja-vu");
  });

  it("never returns a leading or trailing dash", () => {
    expect(slugify("— hello —")).toBe("hello");
  });
});

describe("ensureUniqueSlug", () => {
  it("keeps a free slug", () => {
    expect(ensureUniqueSlug("Office Chaos", ["moneykick-shop"])).toBe("office-chaos");
  });

  it("adds an incremental suffix", () => {
    expect(ensureUniqueSlug("Office Chaos", ["office-chaos"])).toBe("office-chaos-2");
    expect(ensureUniqueSlug("Office Chaos", ["office-chaos", "office-chaos-2"])).toBe(
      "office-chaos-3",
    );
  });

  it("falls back for empty input", () => {
    expect(ensureUniqueSlug("!!!", [])).toBe("project");
  });
});
