import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { startTestPostgres } from "./helpers/licensing-postgres";
import { createLicenseStore } from "@/lib/licensing/transaction-store";
import { createApp, saveApp } from "@/lib/licensing/apps";
import type { Principal } from "@/lib/licensing/contracts";
let runtime:Awaited<ReturnType<typeof startTestPostgres>>;
const owner:Principal={kind:"staff",id:"test-owner",role:"owner",appIds:[],environments:["sandbox","live"],capabilities:[]};
beforeAll(async()=>{runtime=await startTestPostgres();},60000);
afterAll(async()=>{await runtime?.stop();});
describe("real Postgres app foundation",()=>{
  it("creates, renames and preserves a stable app identity",async()=>{
    const store=createLicenseStore(runtime.url,runtime.pool);
    const app=await createApp(store,owner,{name:"Test product",slug:`app-${randomUUID()}`});
    expect(app.id).toMatch(/^[a-f0-9-]{36}$/);
    const saved=await saveApp(store,owner,app.id,{...app.config,name:"Renamed product"});
    expect(saved.id).toBe(app.id);
    expect(saved.name).toBe("Renamed product");
  });
  it("rolls back mutation and its audit together",async()=>{
    const store=createLicenseStore(runtime.url,runtime.pool),uuid=randomUUID();
    await expect(store.transaction(async tx=>{await tx.query("INSERT INTO admin_audit_events(id,actor_id,action) VALUES($1,'test','rollback')",[uuid]);throw new Error("planned failure");})).rejects.toThrow("planned failure");
    expect((await runtime.pool.query("SELECT id FROM admin_audit_events WHERE id=$1",[uuid])).rowCount).toBe(0);
  });
});
