import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { startTestPostgres } from "./helpers/licensing-postgres";
import { createLicenseStore } from "@/lib/licensing/transaction-store";
import { createApp } from "@/lib/licensing/apps";
import { startCodeBatch, processCodeBatch, cancelCodeBatch } from "@/lib/licensing/batches";
import { createAppKey, authenticateAppKey, revokeAppKey } from "@/lib/licensing/api-keys";
import { checkSharedLimit } from "@/lib/licensing/shared-limits";
import type { AppScope, Principal } from "@/lib/licensing/contracts";
let runtime: Awaited<ReturnType<typeof startTestPostgres>>, store: ReturnType<typeof createLicenseStore>, scope: AppScope;
const owner: Principal = { kind:"staff", id:"owner", role:"owner", appIds:[], environments:["sandbox","live"], capabilities:[] };
beforeAll(async()=>{vi.stubEnv("LICENSE_SECRET","local-testing-material-at-least-thirty-two-bytes");runtime=await startTestPostgres();store=createLicenseStore(runtime.url,runtime.pool);const app=await createApp(store,owner,{name:"Operations",slug:`ops-${randomUUID()}`});scope={appId:app.id,environment:"sandbox"};},60000);
afterAll(async()=>{vi.unstubAllEnvs();await runtime?.stop();});
it("resumes chunks, deduplicates requests and preserves issued codes on cancel",async()=>{
  const input={type:"lifetime",count:250};const batch=await startCodeBatch(store,owner,scope,input,"batch-request");
  expect((await startCodeBatch(store,owner,scope,input,"batch-request")).id).toBe(batch.id);
  await expect(startCodeBatch(store,owner,scope,{...input,count:251},"batch-request")).rejects.toMatchObject({code:"idempotency_conflict"});
  await Promise.all([processCodeBatch(store,owner,scope,batch.id),processCodeBatch(store,owner,scope,batch.id)]);
  await cancelCodeBatch(store,owner,scope,batch.id);
  expect((await processCodeBatch(store,owner,scope,batch.id)).created).toBe(0);
  expect((await runtime.pool.query("SELECT count(*) FROM redeem_codes WHERE batch_id=$1",[batch.id])).rows[0].count).toBe("200");
});
it("scopes hashed backend credentials and revokes immediately",async()=>{
  const key=await createAppKey(store,owner,scope,{name:"Backend",capabilities:["identity.write"],expiresAt:"2027-01-01T00:00:00Z"});
  const row=(await runtime.pool.query("SELECT * FROM app_api_keys WHERE id=$1",[key.id])).rows[0];expect(JSON.stringify(row)).not.toContain(key.secret);
  expect((await authenticateAppKey(store,scope,key.secret,"identity.write",new Date("2026-01-01"))).kind).toBe("api");
  await expect(authenticateAppKey(store,{...scope,environment:"live"},key.secret,"identity.write",new Date("2026-01-01"))).rejects.toMatchObject({code:"unauthorized"});
  await revokeAppKey(store,owner,scope,key.id);await expect(authenticateAppKey(store,scope,key.secret,"identity.write",new Date("2026-01-01"))).rejects.toMatchObject({code:"unauthorized"});
});
it("enforces shared limits atomically across concurrent requests",async()=>{
  const now=new Date("2026-01-01");const results=await Promise.allSettled(Array.from({length:20},()=>checkSharedLimit(store,`test:${randomUUID()}:unused`,100,60,now)));
  expect(results.every(r=>r.status==="fulfilled")).toBe(true);
  const key=`shared-${randomUUID()}`;const limited=await Promise.allSettled(Array.from({length:20},()=>checkSharedLimit(store,key,5,60,now)));
  expect(limited.filter(r=>r.status==="fulfilled")).toHaveLength(5);
  await expect(checkSharedLimit(store,key,5,60,new Date(now.getTime()+60000))).resolves.toBeUndefined();
});
