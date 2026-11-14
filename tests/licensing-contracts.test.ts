import { describe, expect, it } from "vitest";
import { appInputSchema, generateCodesSchema, redeemInputSchema } from "@/lib/licensing/contracts";

describe("app and redeem trust boundaries", () => {
  it("requires explicit environment and rejects forged extra identity fields", () => {
    expect(redeemInputSchema.safeParse({app_id: "app", code: "x", device_id: "d"}).success).toBe(false);
    expect(redeemInputSchema.safeParse({app_id: "app", environment: "sandbox", code: "x", device_id: "d", admin: true}).success).toBe(false);
  });
  it("bounds code issuance and rejects ambiguous duration", () => {
    const input = {planKey: "pro", featureKeys: ["export"], type: "timed", durationSeconds: 3600, count: 10, prefix: "APP"};
    expect(generateCodesSchema.safeParse(input).success).toBe(true);
    expect(generateCodesSchema.safeParse({...input,count: 10001}).success).toBe(false);
    expect(generateCodesSchema.safeParse({...input,calendarMonths: 1}).success).toBe(false);
    expect(generateCodesSchema.safeParse({...input,prefix: "<script>"}).success).toBe(false);
  });
  it("uses safe app defaults and refuses invalid feature keys/origins", () => {
    const app = appInputSchema.parse({name: "Example", slug: "example"});
    expect(app.offlineHours).toBe(72);
    expect(app.maxDevices).toBe(2);
    expect(appInputSchema.safeParse({name:"X",slug:"x",offlineHours:0}).success).toBe(false);
    expect(appInputSchema.safeParse({name:"X",slug:"x",allowedOrigins:["*"]}).success).toBe(false);
  });
});
