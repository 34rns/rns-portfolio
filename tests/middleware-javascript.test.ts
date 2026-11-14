import { it,expect,vi,afterEach } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { signAccessToken,publicJwks } from "@/lib/licensing/v1-token";
import { requireLicense as nextGate } from "../sdks/middleware/next";
import { requireLicense as expressGate } from "../sdks/middleware/express";
import { requireLicense as honoGate } from "../sdks/middleware/hono";
afterEach(()=>vi.unstubAllEnvs());
it("all backend adapters require a live validated feature before returning valuable content",async()=>{
 const pair=generateKeyPairSync("ed25519"),now=Date.now();vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY",pair.privateKey.export({format:"der",type:"pkcs8"}).toString("base64"));vi.stubEnv("KEYGATE_ISSUER","https://middleware.example.test");
 const appId="f103734b-d45e-43e6-9e9b-14be5b1083cf",signed=signAccessToken({appId,environment:"sandbox",licenseId:"610de051-b6b0-4b85-8af9-e92d52fb2bc8",source:"app",status:"active",planKey:"pro",features:[{key:"export",expiresAt:null}],expiresAt:null,revision:1,deviceId:"backend-installation"},new Date(now),{offlineHours:72,expiryGraceHours:0});let online=true;
 const options={appId,environment:"sandbox" as const,apiUrl:"https://middleware.example.test/v1",featureKey:"export",fetch:async(url:string)=>{if(!online)throw new Error("offline");return Response.json(url.endsWith("public-key")?publicJwks():signed);}};
 const headers={authorization:`Bearer ${signed.token}`,"x-keygate-device":"backend-installation"},request=new Request("https://protected.example.test/api/export",{headers});
 const handler=nextGate(options,async()=>Response.json({valuable:true}));expect((await handler(request)).status).toBe(200);
 let called=0;await expressGate(options)({headers},{status:()=>({json:()=>null})},()=>{called++;});expect(called).toBe(1);
 await honoGate(options)({req:{raw:request},json:()=>Response.json({denied:true},{status:403})},async()=>{called++;});expect(called).toBe(2);
 online=false;expect((await handler(request)).status).toBe(403);expect((await handler(new Request(request.url))).status).toBe(403);
});
