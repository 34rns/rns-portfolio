import { expect, it } from "vitest";
import { can } from "@/lib/auth/permissions";
import type { Principal } from "@/lib/licensing/contracts";
const base:Principal={kind:"staff",id:"m",role:"helper",appIds:["a"],environments:["sandbox","live"],capabilities:[]};
it("scopes helpers to sandbox issuance and assigned apps",()=>{
  expect(can(base,"codes.generate",{appId:"a",environment:"sandbox"})).toBe(true);
  expect(can(base,"codes.generate",{appId:"a",environment:"live"})).toBe(false);
  expect(can(base,"apps.read",{appId:"b",environment:"sandbox"})).toBe(false);
  expect(can(base,"portfolio.write")).toBe(false);
  expect(can({...base,role:"viewer"},"licenses.write",{appId:"a",environment:"sandbox"})).toBe(false);
});
it("lets the owner operate and does not treat API keys as owners",()=>{
  expect(can({...base,role:"owner"},"team.write")).toBe(true);
  expect(can({...base,kind:"api",role:"owner"},"team.write")).toBe(false);
});
