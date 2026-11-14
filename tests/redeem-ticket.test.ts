import { beforeAll,afterAll,it,expect,vi } from "vitest";
import { createHash,generateKeyPairSync,randomBytes,randomUUID } from "node:crypto";
import { startTestPostgres } from "./helpers/licensing-postgres";
import { createLicenseStore } from "@/lib/licensing/transaction-store";
import { createApp } from "@/lib/licensing/apps";
import { issueCodes,redeemCode } from "@/lib/licensing/access";
import { issueReturnTicket,exchangeReturnTicket } from "@/lib/licensing/redeem-ticket";
import { signAccessToken } from "@/lib/licensing/v1-token";
import { runAdminCommand } from "@/lib/licensing/admin-commands";
import { activateExistingLicense } from "@/lib/licensing/access";
import { handleV1 } from "@/lib/licensing/http";
import type { AppScope,Principal } from "@/lib/licensing/contracts";
let runtime:Awaited<ReturnType<typeof startTestPostgres>>,store:ReturnType<typeof createLicenseStore>,scope:AppScope,token:string;
const now=new Date("2026-01-01"),device="return-ticket-device",origin="https://app.example.test",verifier=randomBytes(32).toString("base64url"),challenge=createHash("sha256").update(verifier).digest("base64url"),owner:Principal={kind:"staff",id:"owner",role:"owner",appIds:[],environments:["sandbox","live"],capabilities:[]};
beforeAll(async()=>{vi.stubEnv("LICENSE_SECRET","local-testing-material-at-least-thirty-two-bytes");vi.stubEnv("KEYGATE_ISSUER","https://tickets.example.test");const pair=generateKeyPairSync("ed25519");vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY",pair.privateKey.export({format:"der",type:"pkcs8"}).toString("base64"));runtime=await startTestPostgres();store=createLicenseStore(runtime.url,runtime.pool);const app=await createApp(store,owner,{name:"Ticket demo",slug:`ticket-${randomUUID()}`,allowedOrigins:[origin]});scope={appId:app.id,environment:"sandbox"};const [code]=await issueCodes(store,owner,scope,{type:"lifetime",count:1}),result=await redeemCode(store,scope,{code:code.key,binding:{deviceId:device}},"ticket-seed",now);token=signAccessToken(result.access,now,app.config).token!;},60000);
afterAll(async()=>{vi.unstubAllEnvs();await runtime?.stop();});
it("binds a one-use return ticket to PKCE, origin, device and environment",async()=>{
 const result=await issueReturnTicket(store,scope,{token,deviceId:device,origin,pkceChallenge:challenge},now);
 await expect(exchangeReturnTicket(store,scope,{ticket:result.ticket,deviceId:device,origin,pkceVerifier:"a".repeat(43)},now)).rejects.toMatchObject({code:"invalid_ticket"});
 await expect(exchangeReturnTicket(store,{...scope,environment:"live"},{ticket:result.ticket,deviceId:device,origin,pkceVerifier:verifier},now)).rejects.toMatchObject({code:"invalid_ticket"});
 const responses=await Promise.allSettled([exchangeReturnTicket(store,scope,{ticket:result.ticket,deviceId:device,origin,pkceVerifier:verifier},now),exchangeReturnTicket(store,scope,{ticket:result.ticket,deviceId:device,origin,pkceVerifier:verifier},now)]);expect(responses.filter(r=>r.status==="fulfilled")).toHaveLength(1);
});
it("refuses expired or unapproved return flows",async()=>{
 await expect(issueReturnTicket(store,scope,{token,deviceId:device,origin:"https://evil.example.test",pkceChallenge:challenge},now)).rejects.toMatchObject({code:"origin_denied"});
 const result=await issueReturnTicket(store,scope,{token,deviceId:device,origin,pkceChallenge:challenge},now);await expect(exchangeReturnTicket(store,scope,{ticket:result.ticket,deviceId:device,origin,pkceVerifier:verifier},new Date(now.getTime()+300000))).rejects.toMatchObject({code:"invalid_ticket"});
});
it("recovery invalidates old proofs and outstanding tickets even after the same device rejoins",async()=>{
 const ticket=await issueReturnTicket(store,scope,{token,deviceId:device,origin,pkceChallenge:challenge},now);
 const licenseId=JSON.parse(Buffer.from(token.split(".")[1],"base64url").toString()).sub;
 const recovered=await runAdminCommand(store,{...owner,authenticatedAt:now.getTime()},"license.recover",scope,{licenseId,reason:"Compromised credential"},now) as {activationKey:string};
 await expect(exchangeReturnTicket(store,scope,{ticket:ticket.ticket,deviceId:device,origin,pkceVerifier:verifier},now)).rejects.toMatchObject({code:"invalid_ticket"});
 await activateExistingLicense(store,scope,{deviceId:device},recovered.activationKey,now);
 await expect(issueReturnTicket(store,scope,{token,deviceId:device,origin,pkceChallenge:challenge},now)).rejects.toMatchObject({code:"unauthorized"});
 const request=new Request("https://tickets.example.test/v1/validate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({app_id:scope.appId,environment:scope.environment,device_id:device,token})});
 expect((await handleV1(request,["validate"],store)).status).toBe(401);
});
