import { test, expect } from "./fixtures";

test("owners retain all legacy pages, project themes, and workspace appearance", async ({page}) => {
 await page.goto("/admin/login"); await page.getByLabel("Email",{exact:true}).fill("owner@example.test"); await page.getByLabel("Password",{exact:true}).fill("Local-demo-password-2026"); await page.getByRole("button",{name:"Sign in",exact:true}).click(); await page.waitForURL("**/admin");
 for (const path of ["/admin/site","/admin/projects","/admin/models","/admin/orders","/admin/checkouts","/admin/licenses","/admin/portfolio","/admin/settings","/admin/help/data","/admin/help/platforms","/admin/help/webhooks"]) {
   const response=await page.goto(path); expect(response?.status(),path).toBe(200); await expect(page.locator("main h1").first()).toBeVisible();
 }
 await page.goto("/admin/projects/new");
 expect(await page.getByLabel("Layout",{exact:true}).locator("option").allTextContents()).toEqual(["Professional","Anime 3D","Synthwave","Cyberpunk","Keycap","FolderDock"]);
 for (const appearance of ["light","dark","system"]) { await page.getByLabel("Admin appearance").selectOption(appearance); await expect(page.locator(".admin-shell")).toHaveAttribute("data-admin-theme",appearance==="system"?"light":appearance); }
 await page.emulateMedia({reducedMotion:"reduce"}); await page.keyboard.press("Control+k"); await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("viewer can learn from Help but cannot generate or change portfolio data", async ({page}) => {
 await page.goto("/admin/login"); await page.getByLabel("Email",{exact:true}).fill("viewer@example.test"); await page.getByLabel("Password",{exact:true}).fill("Local-demo-password-2026"); await page.getByRole("button",{name:"Sign in",exact:true}).click(); await page.waitForURL("**/admin");
 await expect(page.getByRole("link",{name:"Site editor",exact:true})).toHaveCount(0);
 await page.goto("/admin/apps"); await expect(page.getByRole("link",{name:"+ New app",exact:true})).toHaveCount(0); await page.getByRole("link",{name:"Studio toolkit",exact:false}).click(); await page.locator(".kg-tabs").getByRole("link",{name:"Redeem codes",exact:true}).click(); await expect(page.getByRole("button",{name:"Generate sandbox codes"})).toHaveCount(0);
 expect((await page.request.post("/api/admin/models",{data:{}})).status()).toBe(403);
 await page.goto("/admin/help/platforms"); await expect(page.getByRole("heading",{name:"Start with your app's platform"})).toBeVisible();
});
