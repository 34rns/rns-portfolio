import { beforeAll,afterAll,it,expect,vi } from "vitest";
import { createHmac,randomUUID } from "node:crypto";
import { startTestPostgres } from "./helpers/licensing-postgres";
import { createLicenseStore } from "@/lib/licensing/transaction-store";
import { createApp } from "@/lib/licensing/apps";
import { createWebhook,verifyWebhook,isPublicAddress,runLicenseJobs } from "@/lib/licensing/webhooks";
import type { AppScope,Principal } from "@/lib/licensing/contracts";
let runtime:Awaited<ReturnType<typeof startTestPostgres>>,store:ReturnType<typeof createLicenseStore>,scope:AppScope;
const now=new Date("2026-01-01"),owner:Principal={kind:"staff",id:"owner",role:"owner",appIds:[],environments:["sandbox","live"],capabilities:[],authenticatedAt:now.getTime()};
beforeAll(async()=>{vi.stubEnv("LICENSE_SECRET","local-testing-material-at-least-thirty-two-bytes");runtime=await startTestPostgres();store=createLicenseStore(runtime.url,runtime.pool);const app=await createApp(store,owner,{name:"Webhook demo",slug:`hooks-${randomUUID()}`});scope={appId:app.id,environment:"sandbox"};},60000);
afterAll(async()=>{vi.unstubAllEnvs();await runtime?.stop();});
it("verifies raw-body signatures and refuses replay/private destinations",()=>{const body=Buffer.from('{"event":"redeemed"}'),timestamp=now.getTime()/1000,secret="synthetic-webhook-secret";const signature=createHmac("sha256",secret).update(`${timestamp}.`).update(body).digest("hex");expect(verifyWebhook(body,timestamp,signature,secret,now)).toBe(true);expect(verifyWebhook(body,timestamp,signature,secret,new Date(now.getTime()+301000))).toBe(false);expect(verifyWebhook(Buffer.from("tampered"),timestamp,signature,secret,now)).toBe(false);for(const ip of ["127.0.0.1","10.0.0.1","169.254.169.254","172.16.2.1","192.168.1.1","::1","::ffff:127.0.0.1","fc00::1","fe80::1"])expect(isPublicAddress(ip)).toBe(false);});
it("keeps outbox rollback atomic and leases deliveries across concurrent runners",async()=>{
 const webhook=await createWebhook(store,owner,scope,{url:"https://receiver.example.test/hook",events:["redeemed"]},now,async()=>[{address:"1.1.1.1",family:4}]);
 await expect(store.transaction(async tx=>{await tx.query("INSERT INTO license_outbox(app_id,environment,type,payload) VALUES($1,$2,'redeemed','{}')",[scope.appId,scope.environment]);throw new Error("rollback");})).rejects.toThrow("rollback");
 expect((await runtime.pool.query("SELECT count(*) FROM license_outbox WHERE app_id=$1",[scope.appId])).rows[0].count).toBe("0");
 const eventId=randomUUID();await runtime.pool.query("INSERT INTO license_outbox(id,app_id,environment,type,payload) VALUES($1,$2,$3,'redeemed','{}')",[eventId,scope.appId,scope.environment]);
 let sends=0;const transport=async()=>{sends++;return 200;};await Promise.all([runLicenseJobs(store,now,20,transport),runLicenseJobs(store,now,20,transport)]);expect(sends).toBe(1);
 const row=(await runtime.pool.query("SELECT * FROM license_deliveries WHERE event_id=$1 AND webhook_id=$2",[eventId,webhook.id])).rows[0];expect(row.status).toBe("delivered");
});
it("sweeps past already emitted expiries so later customers are never starved",async()=>{
 const ids=Array.from({length:101},()=>randomUUID());await store.transaction(async tx=>{
  await tx.query("INSERT INTO access_licenses(id,app_id,environment,binding_hash,activation_lookup,activation_ciphertext,max_devices) SELECT unnest($1::uuid[]),$2,$3,unnest($4::text[]),unnest($4::text[]),'synthetic',2",[ids,scope.appId,scope.environment,ids.map(id=>`synthetic:${id}`)]);
  await tx.query(`INSERT INTO access_grants(license_id,input,plan_priority,starts_at,expires_at) SELECT unnest($1::uuid[]),'{"type":"timed","planKey":"pro","featureKeys":[],"durationSeconds":60,"stackable":false}',10,$2,$3`,[ids,new Date(now.getTime()-120000),new Date(now.getTime()-60000)]);
 });
 await runLicenseJobs(store,now,1,async()=>200);await runLicenseJobs(store,now,1,async()=>200);
 expect((await runtime.pool.query("SELECT count(*) FROM license_outbox WHERE type='expired' AND license_id=ANY($1::uuid[])",[ids])).rows[0].count).toBe("101");
});
