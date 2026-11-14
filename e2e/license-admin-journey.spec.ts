import { test,expect } from "./fixtures";
import { mkdirSync } from "node:fs";
import path from "node:path";
const password="Local-demo-password-2026";
async function login(page:import("@playwright/test").Page,email="owner@example.test"){await page.goto("/admin/login");await page.getByLabel("Email",{exact:true}).fill(email);await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Sign in",exact:true}).click();await expect(page.getByRole("heading",{name:"Build what comes next."})).toBeVisible();}
test("owner creates a product, generates sandbox access and prepares the integration",async({page})=>{
 await login(page);await page.getByRole("link",{name:"+ New app",exact:true}).click();
 await page.getByLabel("App name",{exact:true}).fill("Browser review app");await page.getByLabel(/^Short name/).fill(`browser-${Date.now()}`);
 await page.getByRole("button",{name:"+ Add feature",exact:true}).click();await page.getByLabel("Feature key",{exact:true}).fill("export_pdf");await page.getByLabel("Display name",{exact:true}).fill("PDF export");
 await page.getByRole("checkbox",{name:"PDF export"}).last().check();await page.getByRole("button",{name:"Create product →"}).click();await expect(page.getByRole("heading",{name:"Browser review app",exact:true})).toBeVisible();
 const appUrl=page.url();await page.locator(".kg-tabs").getByRole("link",{name:"Redeem codes",exact:true}).click();await page.getByLabel(/^Number of codes/).fill("1");await page.getByRole("button",{name:"Generate sandbox codes"}).click();await expect(page.getByText("Codes created. Save any displayed keys securely.")).toBeVisible();
 await expect(page.locator(".kg-result pre")).toContainText("RNS-");
 await page.goto(appUrl);await page.locator(".kg-tabs").getByRole("link",{name:"Add to app",exact:true}).click();await expect(page.getByText("Instructions prepared.",{exact:false})).toBeVisible();await expect(page.getByRole("button",{name:"Copy Codex prompt"})).toBeVisible();
 await page.getByLabel("Admin appearance").selectOption("dark");await expect(page.locator(".admin-shell")).toHaveAttribute("data-admin-theme","dark");
 await page.getByRole("button",{name:"Search",exact:false}).first().click();await expect(page.getByRole("dialog")).toBeVisible();await page.keyboard.press("Escape");await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("helper uses Help and sees only assigned apps with sandbox actions",async({page})=>{
 await login(page,"helper@example.test");await expect(page.getByRole("link",{name:"Site editor",exact:true})).toHaveCount(0);
 await page.getByRole("link",{name:"Help & onboarding",exact:true}).click();await page.getByLabel("Search Help").fill("device limit");await page.getByRole("button",{name:"Search",exact:true}).click();await page.getByRole("link",{name:"Resolve a device limit or lost installation",exact:false}).click();await expect(page.getByRole("heading",{name:"Support workflow"})).toBeVisible();
 await page.goto("/admin/apps");await expect(page.getByRole("link",{name:"+ New app",exact:true})).toHaveCount(0);await page.getByRole("link",{name:"Studio toolkit",exact:false}).click();await page.locator(".kg-tabs").getByRole("link",{name:"Redeem codes",exact:true}).click();await expect(page.getByRole("button",{name:"Generate sandbox codes"})).toBeVisible();await page.getByRole("link",{name:"Live",exact:true}).click();await expect(page.getByRole("button",{name:"Generate live codes"})).toHaveCount(0);
});
test("workspace layout fits desktop and mobile and retains theme access",async({page})=>{
 await login(page);const output=path.resolve(".local/browser-review");mkdirSync(output,{recursive:true});
 await page.screenshot({path:path.join(output,"overview-desktop.png"),fullPage:true});
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);}
 await page.setViewportSize({width:390,height:900});await page.screenshot({path:path.join(output,"overview-mobile.png"),fullPage:true});await page.getByRole("button",{name:"Menu",exact:true}).click();await expect(page.getByRole("link",{name:"Projects & themes"})).toBeVisible();await page.getByRole("link",{name:"Site editor",exact:true}).click();await expect(page.getByRole("heading").first()).toBeVisible();
});
