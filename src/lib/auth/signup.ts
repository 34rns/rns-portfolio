import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(200)
    .pipe(z.email("Enter a valid email address")),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(200, "Keep the password under 200 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;

const FALLBACK = "/account/purchases";

/** Only same-origin absolute paths, and never back into the admin panel. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return FALLBACK;
  if (value.startsWith("/admin")) return FALLBACK;
  return value;
}

export function parseSignupForm(
  formData: FormData,
): { success: true; data: SignupInput } | { success: false; errors: Record<string, string> } {
  const result = signupSchema.safeParse({
    name: String(formData.get("name") ?? "") || undefined,
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (result.success) return { success: true, data: result.data };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
