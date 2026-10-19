import { describe, expect, it } from "vitest";
import { parseSignupForm, safeNextPath, signupSchema } from "@/lib/auth/signup";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("signup", () => {
  it("normalises a valid signup", () => {
    const result = parseSignupForm(
      form({ email: "  Buyer@Example.com ", password: "hunter2hunter2", name: " Ada " }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("buyer@example.com");
      expect(result.data.name).toBe("Ada");
    }
  });

  it("rejects a bad email and a short password", () => {
    const result = parseSignupForm(form({ email: "nope", password: "short" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeTruthy();
      expect(result.errors.password).toBeTruthy();
    }
  });

  it("treats an empty name as absent", () => {
    const parsed = signupSchema.parse({
      email: "a@b.co",
      password: "longenough",
      name: undefined,
    });
    expect(parsed.name).toBeUndefined();
  });

  it("only accepts same-origin paths that stay out of admin", () => {
    expect(safeNextPath("/projects/paid-project")).toBe("/projects/paid-project");
    expect(safeNextPath(undefined)).toBe("/account/purchases");
    expect(safeNextPath("https://evil.example")).toBe("/account/purchases");
    expect(safeNextPath("//evil.example")).toBe("/account/purchases");
    expect(safeNextPath("/admin/projects")).toBe("/account/purchases");
  });
});
