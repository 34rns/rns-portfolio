import { z } from "zod";

const httpUrl = z
  .string()
  .trim()
  .max(600)
  .refine(
    (value) => value === "" || value.startsWith("/") || /^https?:\/\/\S+$/i.test(value),
    "Use a full http(s) URL or a path inside /public",
  );

const optionalText = z.string().trim().max(2000);

export const projectInputSchema = z
  .object({
    title: z.string().trim().min(1, "Add a title").max(120),
    slug: z
      .string()
      .trim()
      .min(1, "Add a slug")
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single dashes only"),
    tagline: z.string().trim().min(1, "Add a one-line tagline").max(200),
    description: z.string().trim().min(1, "Write the case study"),
    coverImageUrl: httpUrl,
    gallery: z.array(httpUrl).max(24),
    tags: z.array(z.string().trim().min(1).max(40)).max(12),
    liveUrl: httpUrl,
    repoUrl: httpUrl,
    year: z.coerce.number().int().min(2000).max(2100),
    status: z.enum(["draft", "published"]),
    placement: z.enum(["featured", "unlisted"]),
    theme: z.string().trim().min(1).max(60),
    themeAccent: z
      .string()
      .trim()
      .refine((value) => value === "" || /^#[0-9a-fA-F]{6}$/.test(value), "Use a 6-digit hex colour"),
    isPaid: z.boolean(),
    priceCents: z.number().int().min(0).max(10_000_000).nullable(),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code"),
    providerProductId: optionalText,
    deliveryNote: z.string().trim().max(4000),
    sortOrder: z.coerce.number().int().min(0).max(9999),
  })
  .refine((value) => !value.isPaid || (value.priceCents ?? 0) > 0, {
    message: "Paid projects need a price above zero",
    path: ["priceCents"],
  });

export type ProjectInput = z.infer<typeof projectInputSchema>;

export type FieldErrors = Record<string, string>;

export function parseProjectForm(
  formData: FormData,
): { success: true; data: ProjectInput } | { success: false; errors: FieldErrors } {
  const price = String(formData.get("priceCents") ?? "").trim();

  const candidate = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    gallery: String(formData.get("gallery") ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    liveUrl: String(formData.get("liveUrl") ?? ""),
    repoUrl: String(formData.get("repoUrl") ?? ""),
    year: String(formData.get("year") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    placement: String(formData.get("placement") ?? "featured"),
    theme: String(formData.get("theme") ?? "professional"),
    themeAccent: String(formData.get("themeAccent") ?? ""),
    isPaid: formData.get("isPaid") === "on",
    priceCents: price ? Math.round(Number(price) * 100) : null,
    currency: String(formData.get("currency") ?? "USD"),
    providerProductId: String(formData.get("providerProductId") ?? ""),
    deliveryNote: String(formData.get("deliveryNote") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
  };

  const result = projectInputSchema.safeParse(candidate);
  if (result.success) return { success: true, data: result.data };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
