import { afterEach, expect, it, vi } from "vitest";
const calls = vi.hoisted(() => ({ run: vi.fn(async () => ({ processed: 0, failed: 0 })) }));
vi.mock("@/lib/licensing/transaction-store", () => ({ getLicenseStore: () => ({}) }));
vi.mock("@/lib/licensing/webhooks", () => ({ runLicenseJobs: calls.run }));
import { POST } from "@/app/api/internal/license-jobs/route";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
it("refuses an unauthorized scheduler before reading storage", async () => {
  vi.stubEnv("LICENSE_JOBS_SECRET", "test-job-key-123456789012345678901234");
  expect((await POST(new Request("https://site.example.test/api/internal/license-jobs", { method: "POST" }))).status).toBe(401); expect(calls.run).not.toHaveBeenCalled();
});
it("runs the configured bounded batch with the dedicated scheduler credential", async () => {
  const secret = "test-job-key-123456789012345678901234";
  vi.stubEnv("LICENSE_JOBS_SECRET", secret); vi.stubEnv("LICENSE_JOBS_BATCH_LIMIT", "6");
  const result = await POST(new Request("https://site.example.test/api/internal/license-jobs", { method: "POST", headers: { authorization: `Bearer ${secret}` } }));
  expect(result.status).toBe(200); expect(calls.run).toHaveBeenCalledWith({}, expect.any(Date), 6);
});
