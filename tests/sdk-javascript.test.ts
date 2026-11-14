import { it,expect,vi,afterEach } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { createKeyGateClient } from "../sdks/javascript/src/index";
import type { StoredAccess } from "../sdks/javascript/src/index";
import { signAccessToken,publicJwks } from "@/lib/licensing/v1-token";
import type { AccessSnapshot } from "@/lib/licensing/contracts";
afterEach(()=>vi.unstubAllEnvs());
it("verifies actual Ed25519 tokens and never extends the signed offline/feature deadline",async()=>{
 const pair=generateKeyPairSync("ed25519");vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY",pair.privateKey.export({format:"der",type:"pkcs8"}).toString("base64"));vi.stubEnv("KEYGATE_ISSUER","https://sdk.example.test");
 let now=Date.parse("2026-01-01"),online=true,stored:StoredAccess|null=null;
 const appId="f103734b-d45e-43e6-9e9b-14be5b1083cf",access:AccessSnapshot={licenseId:"610de051-b6b0-4b85-8af9-e92d52fb2bc8",source:"app",appId,environment:"sandbox",status:"active",planKey:"pro",features:[{key:"export",expiresAt:"2026-01-01T01:00:00.000Z"}],expiresAt:null,revision:1,deviceId:"sdk-installation"};
 const fetcher=async(url:string|URL)=>{if(!online)throw new TypeError("offline");return Response.json(String(url).endsWith("public-key")?publicJwks():{...signAccessToken(access,new Date(now),{offlineHours:72,expiryGraceHours:0}),activationKey:"synthetic-activation-credential"});};
 const client=createKeyGateClient({appId,environment:"sandbox",apiUrl:"https://sdk.example.test/v1",deviceId:"sdk-installation",clock:()=>now,fetch:fetcher,storage:{read:async()=>stored,write:async(value)=>{stored=value;},clear:async()=>{stored=null;}}});
 await client.redeem("SYNTHETIC-CODE");expect(await client.can("export")).toBe(true);
 online=false;now+=7200000;expect(await client.can("export")).toBe(false);await expect(client.validate()).resolves.toMatchObject({status:"active"});
 now=Date.parse("2026-01-04");await expect(client.validate()).rejects.toMatchObject({code:"expired"});expect(await client.can("export")).toBe(false);
});
it("fails locked when verified storage is unavailable",async()=>{const client=createKeyGateClient({appId:"f103734b-d45e-43e6-9e9b-14be5b1083cf",environment:"sandbox",apiUrl:"https://sdk.example.test/v1",storage:{read:async()=>{throw new Error("blocked");},write:async()=>{},clear:async()=>{}}});expect(await client.can("export")).toBe(false);await expect(client.redeem("code")).rejects.toMatchObject({code:"storage_unavailable"});});
