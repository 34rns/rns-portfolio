import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Keep the logo checks runnable without changing the repository-wide config.
export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 15000,
    exclude: ["node_modules/**", ".local/**", ".vercel/**", ".open-next/**", ".wrangler/**"],
    include: ["tests/**/*.test.ts", "src/themes/professional/components/brand-logo/*.test.ts"],
    env: { MOCK_PAYMENT_SECRET: "vitest-mock-secret", PAYMENT_PROVIDER: "mock" },
  },
  resolve: { alias: { "@": fileURLToPath(new URL("../../../../", import.meta.url)) } },
});
