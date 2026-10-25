import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // MOCK_PAYMENT_SECRET has no fallback value in the source, so the tests
    // that sign mock webhooks need one set explicitly.
    env: {
      MOCK_PAYMENT_SECRET: "vitest-mock-secret",
      PAYMENT_PROVIDER: "mock",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
