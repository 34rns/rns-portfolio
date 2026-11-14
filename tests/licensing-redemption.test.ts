import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import { startTestPostgres } from "./helpers/licensing-postgres";
import { createLicenseStore } from "@/lib/licensing/transaction-store";
import { createApp } from "@/lib/licensing/apps";
import { issueCodes, redeemCode, activateExistingLicense, applyLicenseAction, deactivateDevice, inspectAccess } from "@/lib/licensing/access";
import type { AppScope, Principal } from "@/lib/licensing/contracts";
import { runAdminCommand } from "@/lib/licensing/admin-commands";
let runtime:Awaited<ReturnType<typeof startTestPostgres>>;
let store:ReturnType<typeof createLicenseStore>,scope:AppScope;
const owner:Principal={kind:"staff",id:"test-owner",role:"owner",appIds:[],environments:["sandbox","live"],capabilities:[]};
const epoch=new Date("2026-01-31T12:00:00Z");
beforeAll(async()=>{
  runtime=await startTestPostgres();store=createLicenseStore(runtime.url,runtime.pool);
  vi.stubEnv("LICENSE_SECRET","isolated-testing-secret-material-at-least-thirty-two-bytes");
  const pair=generateKeyPairSync("ed25519");vi.stubEnv("LICENSE_TOKEN_PRIVATE_KEY",pair.privateKey.export({format:"der",type:"pkcs8"}).toString("base64"));
  const app=await createApp(store,owner,{name:"Access test",slug:`access-${randomUUID()}`,features:[{key:"export",name:"Export"}],plans:[{key:"free",name:"Free"},{key:"pro",name:"Pro",priority:10,featureKeys:["export"]}]});scope={appId:app.id,environment:"sandbox"};
},60000);
afterAll(async()=>{vi.unstubAllEnvs();await runtime?.stop();});
const issue=(patch:Record<string,unknown>={})=>issueCodes(store,owner,scope,{type:"timed",planKey:"pro",durationSeconds:3600,prefix:"TEST",count:1,...patch});
describe("atomic licensing access",()=>{
  it("keeps stackable feature bundles independent of unrelated feature durations", async()=>{
    const app=await createApp(store,owner,{name:"Bundle isolation",slug:`bundles-${randomUUID()}`,features:[{key:"alpha",name:"Alpha"},{key:"beta",name:"Beta"}]});
    const scoped={appId:app.id,environment:"sandbox" as const},binding={deviceId:"independent-bundle-device"};
    const [base]=await issueCodes(store,owner,scoped,{type:"lifetime",count:1});
    const first=await redeemCode(store,scoped,{code:base.key,binding},"independent-base",epoch);
    for(const [feature,duration] of [["alpha",30*86400],["beta",3600]] as const){
      const [code]=await issueCodes(store,owner,scoped,{type:"bundle",featureKeys:[feature],durationSeconds:duration,stackable:true,count:1});
      await redeemCode(store,scoped,{code:code.key,binding,activationKey:first.activationKey},`bundle-${feature}`,epoch);
    }
    expect((await inspectAccess(store,scoped,first.access.licenseId,binding.deviceId,new Date(epoch.getTime()+7200000))).features.map(f=>f.key)).toEqual(["alpha"]);
    const pausedBinding={deviceId:"paused-bundle-device"};
    const [pausedBase]=await issueCodes(store,owner,scoped,{type:"lifetime",count:1});
    const paused=await redeemCode(store,scoped,{code:pausedBase.key,binding:pausedBinding},"paused-base",epoch);
    await applyLicenseAction(store,owner,scoped,{licenseId:paused.access.licenseId,action:"pause",reason:"Pause fixture"},epoch);
    for(const [feature,duration] of [["alpha",30*86400],["beta",3600]] as const){
      const [code]=await issueCodes(store,owner,scoped,{type:"bundle",featureKeys:[feature],durationSeconds:duration,stackable:true,count:1});
      await redeemCode(store,scoped,{code:code.key,binding:pausedBinding,activationKey:paused.activationKey},`paused-${feature}`,epoch);
    }
    const resumedAt=new Date(epoch.getTime()+3600000);
    await applyLicenseAction(store,owner,scoped,{licenseId:paused.access.licenseId,action:"resume",reason:"Resume fixture"},resumedAt);
    expect((await inspectAccess(store,scoped,paused.access.licenseId,pausedBinding.deviceId,new Date(resumedAt.getTime()+7200000))).features.map(f=>f.key)).toEqual(["alpha"]);
  });
  it("credential recovery prevents both same-key and fresh-key redemption replay", async()=>{
    const [code]=await issue(); const input={code:code.key,binding:{deviceId:"recovered-installation"}};
    const first=await redeemCode(store,scope,input,"before-recovery",epoch);
    const recovered=await runAdminCommand(store,{...owner,authenticatedAt:epoch.getTime()},"license.recover",scope,{licenseId:first.access.licenseId,reason:"Verified customer recovery"},epoch) as {activationKey:string};
    for(const key of ["before-recovery","after-recovery"]){await expect(redeemCode(store,scope,input,key,epoch)).rejects.toMatchObject({code:"unauthorized"});}
    expect(recovered.activationKey).not.toBe(first.activationKey);
    expect((await activateExistingLicense(store,scope,{deviceId:"replacement-installation"},recovered.activationKey,epoch)).status).toBe("active");
  });
  it("refuses a feature bundle without a base grant without consuming its code", async()=>{
    const [code]=await issue({type:"bundle"});
    await expect(redeemCode(store,scope,{code:code.key,binding:{deviceId:"bundle-no-base"}},"bundle-no-base",epoch)).rejects.toMatchObject({code:"base_license_required"});
    expect((await runtime.pool.query("SELECT redemption_count FROM redeem_codes WHERE id=$1",[code.id])).rows[0].redemption_count).toBe(0);
  });
  it("issues secure scoped codes",async()=>{const codes=await issue({count:3});expect(codes).toHaveLength(3);expect(new Set(codes.map(c=>c.key)).size).toBe(3);expect(codes[0].key).toMatch(/^TEST-([2-9A-HJ-NP-Z]{4}-){3}[2-9A-HJ-NP-Z]{4}$/);});
  it("allows exactly one successful final redemption under concurrency",async()=>{
    const [code]=await issue();const results=await Promise.allSettled(Array.from({length:20},(_,i)=>redeemCode(store,scope,{code:code.key,binding:{deviceId:`installation-${i}`}},`request-${i}`,epoch)));
    expect(results.filter(r=>r.status==="fulfilled")).toHaveLength(1);
    const result=await runtime.pool.query("SELECT redemption_count FROM redeem_codes WHERE id=$1",[code.id]);expect(result.rows[0].redemption_count).toBe(1);
  });
  it("replays safely and joins a second device without another redemption",async()=>{
    const [code]=await issue();const input={code:code.key,binding:{deviceId:"primary-installation"}};
    const first=await redeemCode(store,scope,input,"first",epoch),again=await redeemCode(store,scope,input,"second",epoch);
    expect(again.access.licenseId).toBe(first.access.licenseId);
    const second=await activateExistingLicense(store,scope,{deviceId:"second-installation"},first.activationKey!,epoch);
    expect(second.licenseId).toBe(first.access.licenseId);
    await expect(activateExistingLicense(store,scope,{deviceId:"third-installation"},first.activationKey!,epoch)).rejects.toMatchObject({code:"device_limit"});
    await deactivateDevice(store,scope,second.licenseId,"second-installation",epoch);
    await deactivateDevice(store,scope,second.licenseId,"second-installation",epoch);
    expect((await activateExistingLicense(store,scope,{deviceId:"third-installation"},first.activationKey!,epoch)).status).toBe("active");
    expect((await runtime.pool.query("SELECT redemption_count FROM redeem_codes WHERE id=$1",[code.id])).rows[0].redemption_count).toBe(1);
  });
  it("rejects other environment and changed idempotency bodies",async()=>{
    const [code]=await issue();await expect(redeemCode(store,{...scope,environment:"live"},{code:code.key,binding:{deviceId:"cross-env-device"}},"cross",epoch)).rejects.toMatchObject({code:"invalid_code"});
    await redeemCode(store,scope,{code:code.key,binding:{deviceId:"idempotency-device"}},"stable",epoch);
    await expect(redeemCode(store,scope,{code:code.key,binding:{deviceId:"different-device"}},"stable",epoch)).rejects.toMatchObject({code:"idempotency_conflict"});
  });
  it("clamps calendar months and preserves paused time",async()=>{
    const [code]=await issue({durationSeconds:undefined,calendarMonths:1});
    const first=await redeemCode(store,scope,{code:code.key,binding:{deviceId:"calendar-device"}},"calendar",epoch);
    expect(first.access.expiresAt).toBe("2026-02-28T12:00:00.000Z");
    await applyLicenseAction(store,owner,scope,{licenseId:first.access.licenseId,action:"pause",reason:"Customer request"},new Date("2026-02-01T12:00:00Z"));
    const resumed=await applyLicenseAction(store,owner,scope,{licenseId:first.access.licenseId,action:"resume",reason:"Return"},new Date("2026-03-01T12:00:00Z"));
    expect(resumed.expiresAt).toBe("2026-03-28T12:00:00.000Z");
  });
  it("keeps temporary features temporary on lifetime access and undoes only one grant",async()=>{
    const [base]=await issue({type:"lifetime",durationSeconds:undefined,planKey:"free",featureKeys:[]});
    const first=await redeemCode(store,scope,{code:base.key,binding:{deviceId:"lifetime-device"}},"lifetime",epoch);
    const [bundle]=await issue({type:"bundle",stackable:true});
    await redeemCode(store,scope,{code:bundle.key,binding:{deviceId:"lifetime-device"},activationKey:first.activationKey},"bundle",epoch);
    const expired=await inspectAccess(store,scope,first.access.licenseId,"lifetime-device",new Date(epoch.getTime()+7200000));
    expect(expired.status).toBe("active");expect(expired.features).toHaveLength(0);
    const [redemption]= (await runtime.pool.query("SELECT id FROM code_redemptions WHERE code_id=$1",[bundle.id])).rows;
    await applyLicenseAction(store,owner,scope,{licenseId:first.access.licenseId,action:"undo",redemptionId:redemption.id,reason:"Support correction"},epoch);
    expect((await inspectAccess(store,scope,first.access.licenseId,"lifetime-device",epoch)).features).toHaveLength(0);
    expect((await runtime.pool.query("SELECT redemption_count FROM redeem_codes WHERE id=$1",[bundle.id])).rows[0].redemption_count).toBe(1);
  });
});
