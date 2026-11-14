import SwaggerParser from "@apidevtools/swagger-parser";
import { it,expect } from "vitest";
import { openapi } from "@/lib/licensing/openapi";
it("validates the published OpenAPI contract with an actual parser",async()=>{const parsed=await SwaggerParser.validate(JSON.parse(JSON.stringify(openapi)));expect("openapi" in parsed?parsed.openapi:null).toBe("3.1.0");expect(Object.keys(parsed.paths??{})).toContain("/activate");});
