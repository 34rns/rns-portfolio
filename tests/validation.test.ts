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

  it("defaults the 3D stage when the theme does not use one", () => {
    const result = parseProjectForm(formData());

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.modelUrl).toBe("");
    expect(result.data.lighting).toBe("studio");
    expect(result.data.modelScale).toBe(1);
    expect(result.data.modelOffsetX).toBe(0);
  });

  it("accepts an uploaded model path and stage tuning", () => {
    const result = parseProjectForm(
      formData({
        modelUrl: "/api/uploads/model/2026-10/scene.glb",
        lighting: "neon",
        modelScale: "1.4",
        modelOffsetY: "-0.25",
      }),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.modelUrl).toBe("/api/uploads/model/2026-10/scene.glb");
    expect(result.data.lighting).toBe("neon");
    expect(result.data.modelScale).toBe(1.4);
    expect(result.data.modelOffsetY).toBe(-0.25);
  });

  it("rejects an unknown lighting preset", () => {
    const result = parseProjectForm(formData({ lighting: "disco" }));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.lighting).toBeDefined();
  });

  it("rejects a model offset outside the stage limits", () => {
    const result = parseProjectForm(formData({ modelOffsetX: "40" }));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.modelOffsetX).toBeDefined();
  });
});
