import { test, expect } from "./fixtures";

test("staff owners retain model/upload APIs while helpers and guests are denied", async ({ page }) => {
  expect((await page.request.post("/api/admin/models", { data: {} })).status()).toBe(401);
  for (const [email, expected] of [["owner@example.test", 400], ["helper@example.test", 403]] as const) {
    await page.goto("/admin/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Local-demo-password-2026");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin");
    for (const endpoint of ["/api/admin/models", "/api/admin/models/00000000-0000-4000-8000-000000000001", "/api/admin/upload", "/api/admin/upload/blob"]) {
      expect((await page.request.post(endpoint, { data: {} })).status(), `${email}: ${endpoint}`).toBe(expected);
    }
    await page.context().clearCookies();
  }
});
