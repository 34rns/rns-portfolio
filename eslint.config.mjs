import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".local/**",
    ".vercel/**",
    ".open-next/**",
    ".wrangler/**",
    "sdks/javascript/dist/**",
    "public/widget.js",
  ]),
  { files: ["scripts/licensing/windows-symlink.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
]);

export default eslintConfig;
