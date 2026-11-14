import { it, expect } from "vitest";
import { mkdtemp, mkdir, writeFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { packageIntegrationKit } from "../scripts/licensing/package-module";

it("exports only source/docs and excludes private files and generated dependencies", async () => {
 const temporary=await mkdtemp(path.join(os.tmpdir(),"keygate-kit-"));
 try {
  const root=path.join(temporary,"input"), output=path.join(temporary,"output");
  await mkdir(path.join(root,"sdks/javascript/node_modules"),{recursive:true});
  await mkdir(path.join(root,"sdks/javascript/src"));
  await writeFile(path.join(root,"sdks/javascript/src/index.ts"),"export const version = 1;");
  await writeFile(path.join(root,"sdks/javascript/.env.local"),"PRIVATE_TEST_SECRET=never-export");
  await writeFile(path.join(root,"sdks/javascript/backup.json"),"private-customer-record");
  await writeFile(path.join(root,"sdks/javascript/node_modules/private.js"),"private-dependency");
  await mkdir(path.join(root,"examples"));
  await writeFile(path.join(root,"examples/customer-export.json"),JSON.stringify({email:"customer@example.test",apiKey:"private-synthetic-key"}));
  const report=await packageIntegrationKit(root,output);
  expect(report.files).toHaveLength(1);
  expect(report.files[0].path).toBe("sdks/javascript/src/index.ts");
  expect(await readdir(path.join(output,"sdks/javascript/src"))).toEqual(["index.ts"]);
  await expect(packageIntegrationKit(root,output)).rejects.toThrow("already exists");
 } finally { await rm(temporary,{recursive:true,force:true}); }
});
