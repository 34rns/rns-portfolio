import { it, expect } from "vitest";
import { build } from "esbuild";

it("builds a self-contained browser widget without Node or remote dependencies", async () => {
  const result = await build({entryPoints:["src/widget/index.ts"],bundle:true,write:false,platform:"browser",format:"iife",minify:true});
  const script=result.outputFiles[0].text;
  expect(script.length).toBeLessThan(40000);
  expect(script).toContain("data-keygate");
  expect(script).not.toContain("require(");
});
