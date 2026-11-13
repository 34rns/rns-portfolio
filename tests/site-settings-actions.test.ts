import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSiteSettings } from "../src/lib/site-settings/config";
const mock = vi.hoisted(() => ({ admin: vi.fn(), write: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mock.admin }));
vi.mock("@/lib/site-settings/store", () => ({ writeSiteState: mock.write }));
vi.mock("next/cache", () => ({ revalidatePath: mock.revalidate }));
import { saveSiteSettings } from "../src/app/admin/(panel)/site/actions";
function form(intent = "draft", settings: unknown = defaultSiteSettings, revision = "0") {
  const f = new FormData(); f.set("intent", intent); f.set("settings", JSON.stringify(settings)); f.set("revision", revision); return f;
}
describe("site editor security and publication boundary", () => {
  beforeEach(() => { vi.clearAllMocks(); mock.admin.mockResolvedValue({ email: "admin@example.test" }); mock.write.mockResolvedValue({ draft: defaultSiteSettings, revision: 1 }); });
  it("preserves the authentication redirect and never writes", async () => {
    mock.admin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(saveSiteSettings({}, form())).rejects.toThrow("NEXT_REDIRECT");
    expect(mock.write).not.toHaveBeenCalled();
  });
  it("rejects invalid settings and request envelopes", async () => {
    for (const f of [form("delete"), form("draft", { ...defaultSiteSettings, contactUrl: "javascript:alert(1)" }), form("draft", defaultSiteSettings, "-1")]) {
      expect((await saveSiteSettings({}, f)).error).toBeTruthy();
    }
    expect(mock.write).not.toHaveBeenCalled();
  });
  it("saves a draft without invalidating the public homepage", async () => {
    const result = await saveSiteSettings({}, form());
    expect(mock.write).toHaveBeenCalledWith(defaultSiteSettings, 0, "draft");
    expect(mock.revalidate.mock.calls).toEqual([["/admin/site"], ["/admin/site-preview"]]);
    expect(result.revision).toBe(1);
  });
  it("keeps the last saved revision when validation fails, so correcting a field can be retried", async () => {
    const previous = { revision: 7, settings: defaultSiteSettings, message: "Draft saved." };
    const result = await saveSiteSettings(previous, form("draft", { ...defaultSiteSettings, accent: "invalid" }));
    expect(result.revision).toBe(7);
    expect(result.settings).toEqual(defaultSiteSettings);
    expect(result.message).toBeUndefined();
    expect(mock.write).not.toHaveBeenCalled();
  });
  it("publishes and invalidates public content only after storage succeeds", async () => {
    await saveSiteSettings({}, form("publish"));
    expect(mock.revalidate).toHaveBeenCalledWith("/");
    mock.revalidate.mockClear(); mock.write.mockRejectedValue(new Error("Settings changed in another tab. Reload before saving."));
    const result = await saveSiteSettings({}, form("publish"));
    expect(result.error).toContain("another tab");
    expect(mock.revalidate).not.toHaveBeenCalled();
    expect(result.settings).toBeUndefined();
  });
});
