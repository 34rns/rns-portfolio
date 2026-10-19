import { describe, expect, it } from "vitest";
import { parseProjectForm } from "@/lib/projects/validation";

function formData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values: Record<string, string> = {
    title: "MoneyKick Shop",
    slug: "moneykick-shop",
    tagline: "A storefront built for how Bangladesh pays.",
    description: "## Case study\n\nReal content.",
    coverImageUrl: "",
    gallery: "/seed/one.png\nhttps://example.com/two.png",
    tags: "Next.js, TypeScript",
    liveUrl: "https://moneykickshop1.vercel.app",
    repoUrl: "",
    year: "2025",
    status: "published",
    placement: "featured",
    theme: "professional",
    themeAccent: "",
    currency: "USD",
    providerProductId: "",
    sortOrder: "0",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

describe("parseProjectForm", () => {
  it("parses a valid project and splits lists", () => {
    const result = parseProjectForm(formData());

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.tags).toEqual(["Next.js", "TypeScript"]);
    expect(result.data.gallery).toHaveLength(2);
    expect(result.data.priceCents).toBeNull();
  });

  it("converts the price to cents", () => {
    const result = parseProjectForm(
      formData({ isPaid: "on", priceCents: "19.00" }),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.priceCents).toBe(1900);
    expect(result.data.isPaid).toBe(true);
  });

  it("rejects a bad slug", () => {
    const result = parseProjectForm(formData({ slug: "Not A Slug" }));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.slug).toBeDefined();
  });

  it("rejects a paid project without a price", () => {
    const result = parseProjectForm(formData({ isPaid: "on", priceCents: "" }));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.priceCents).toBeDefined();
  });

  it("rejects a non-http cover URL", () => {
    const result = parseProjectForm(formData({ coverImageUrl: "not-a-url" }));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.coverImageUrl).toBeDefined();
  });
});
