import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import { startTestPostgres } from "./helpers/licensing-postgres";
import { createLicenseStore } from "@/lib/licensing/transaction-store";
import { createApp } from "@/lib/licensing/apps";
import { handleV1 } from "@/lib/licensing/http";
import { generateLicenseKey, licenseKeyLookup, encryptLicenseKey } from "@/lib/licensing/keys";
import type { Principal } from "@/lib/licensing/contracts";

let runtime: Awaited<ReturnType<typeof startTestPostgres>>, store: ReturnType<typeof createLicenseStore>;
const owner: Principal = { kind: "staff", id: "owner", role: "owner", appIds: [], environments: ["sandbox", "live"], capabilities: [] };
beforeAll(async () => {
  vi.stubEnv("LICENSE_SECRET", "synthetic-bridge-material-at-least-thirty-two-bytes");
  vi.stubEnv("KEYGATE_ISSUER", "https://licenses.example.test");
  vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY", generateKeyPairSync("ed25519").privateKey.export({format:"der",type:"pkcs8"}).toString("base64"));
  runtime = await startTestPostgres(); store = createLicenseStore(runtime.url, runtime.pool);
}, 60000);
afterAll(async () => { vi.unstubAllEnvs(); await runtime?.stop(); });

it("keeps legacy keys, expiry and device slots shared with the original API without copying grants", async () => {
  const slug = `bridge-${randomUUID()}`;
  const project = (await runtime.pool.query("INSERT INTO projects(slug,title,tagline,description,year,status) VALUES($1,'Bridge','Test','Synthetic',2026,'published') RETURNING id", [slug])).rows[0];
  const app = await createApp(store, owner, { name: "Legacy app", slug: `legacy-${randomUUID()}`, linkedProjectId: project.id, features: [{key:"export_pdf",name:"Export"}], plans: [{key:"free",name:"Free"},{key:"pro",name:"Pro",priority:10,featureKeys:["export_pdf"]}] });
  const code = generateLicenseKey(), started = new Date(Date.now() - 86400000);
  const license = (await runtime.pool.query("INSERT INTO licenses(key_lookup,key_ciphertext,project_slugs,type,days,first_activated_at) VALUES($1,$2,$3,'timelimited',30,$4) RETURNING id", [licenseKeyLookup(code), encryptLicenseKey(code), [slug], started])).rows[0];
  const post = (path: string, device: string, fields: object, environment = "live", appId = app.id) => handleV1(new Request(`https://licenses.example.test/v1/${path}`, { method: "POST", headers: {"content-type":"application/json","idempotency-key":`legacy-${device}`}, body: JSON.stringify({app_id:appId,environment,device_id:device,...fields}) }), [path], store);
  const responses = await Promise.all(Array.from({length:8}, () => post("redeem", "legacy-device-one", {code})));
  expect(responses.map(r => r.status)).toEqual(Array(8).fill(200));
  const result = await responses[0].json();
  expect(result.access).toMatchObject({source:"legacy",licenseId:license.id,planKey:"pro",expiresAt:new Date(started.getTime()+30*86400000).toISOString()});
  expect(result.activationKey).toBe(code);
  expect((await post("activate", "legacy-device-two", {activation_key:code})).status).toBe(200);
  expect((await post("activate", "legacy-device-three", {activation_key:code})).status).toBe(409);
  expect((await runtime.pool.query("SELECT activation_count FROM licenses WHERE id=$1", [license.id])).rows[0].activation_count).toBe(2);
  expect((await post("redeem", "legacy-sandbox", {code}, "sandbox")).status).toBe(401);
  const unrelated = await createApp(store, owner, {name:"Unrelated",slug:`unrelated-${randomUUID()}`});
  expect((await post("redeem", "legacy-other-app", {code}, "live", unrelated.id)).status).toBe(401);
  expect((await post("deactivate", "legacy-device-one", {token:result.token})).status).toBe(200);
  expect((await post("validate", "legacy-device-one", {token:result.token})).status).toBe(401);
  expect((await post("activate", "legacy-device-three", {activation_key:code})).status).toBe(200);
  await runtime.pool.query("UPDATE licenses SET revoked_at=now() WHERE id=$1", [license.id]);
  expect((await post("redeem", "legacy-device-two", {code})).status).toBe(403);
  expect((await runtime.pool.query("SELECT count(*) FROM access_grants")).rows[0].count).toBe("0");
  expect((await runtime.pool.query("SELECT first_activated_at FROM licenses WHERE id=$1", [license.id])).rows[0].first_activated_at).toEqual(started);
});
