import { beforeAll, afterAll, it, expect, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { startTestPostgres } from "./helpers/licensing-postgres";
import { createLicenseStore } from "@/lib/licensing/transaction-store";
import { createApp } from "@/lib/licensing/apps";
import { issueCodes, redeemCode } from "@/lib/licensing/access";
import { getLicenseMetrics } from "@/lib/licensing/analytics";
import { csvCell, parseCsv, previewCodeImport, importCodes, exportCodes } from "@/lib/licensing/exports";
import { captureBackup, restoreBackup } from "@/lib/licensing/backup";
import { codePage, accessPage, activityPage } from "@/lib/licensing/admin-data";
import type { Principal, AppScope } from "@/lib/licensing/contracts";
let runtime:Awaited<ReturnType<typeof startTestPostgres>>,store:ReturnType<typeof createLicenseStore>,scope:AppScope;
const now=new Date(),owner:Principal={kind:"staff",id:"report-owner",role:"owner",appIds:[],environments:["sandbox","live"],capabilities:[],authenticatedAt:now.getTime()};
beforeAll(async()=>{vi.stubEnv("LICENSE_SECRET","isolated-reporting-test-material-at-least-thirty-two-bytes");runtime=await startTestPostgres();store=createLicenseStore(runtime.url,runtime.pool);const app=await createApp(store,owner,{name:"Reports",slug:`reports-${randomUUID()}`});scope={appId:app.id,environment:"sandbox"};},60000);
afterAll(async()=>{vi.unstubAllEnvs();await runtime?.stop();});
it("handles quoted Unicode CSV and neutralizes spreadsheet formulas",()=>{expect(csvCell('=SUM(A1)')).toBe('"\'=SUM(A1)"');expect(parseCsv('key,note\r\n"TEST","line one\nবাংলা, two"\r\n')).toEqual([["key","note"],["TEST","line one\nবাংলা, two"]]);expect(()=>parseCsv('"unclosed')).toThrow();});
it("scopes real metrics and exports and atomically refuses duplicate imports",async()=>{
 const [code]=await issueCodes(store,owner,scope,{type:"timed",durationSeconds:3600,count:1});await redeemCode(store,scope,{code:code.key,binding:{deviceId:"reporting-installation"}},"report-request",now);
 const metrics=await getLicenseMetrics(store,owner,scope,now);expect(metrics.redemptions).toBe(1);expect(metrics.active).toBe(1);expect(metrics.daily.reduce((a,b)=>a+b.count,0)).toBe(1);
 const csv='key,type,plan,duration_seconds,note\nTEST-ABCD-EFGH-JKLM-NPQR,lifetime,pro,,"=formula"';
 const preview=await previewCodeImport(store,owner,scope,csv);expect(preview.errors).toEqual([]);await importCodes(store,owner,scope,csv,now);expect((await previewCodeImport(store,owner,scope,csv)).errors[0]).toContain("duplicate");
 await expect(importCodes(store,owner,scope,csv,now)).rejects.toThrow();const exported=await exportCodes(store,owner,scope,"csv",false,now);expect(exported).not.toContain(code.key);expect(exported).toContain("'=formula");
 const helper:Principal={...owner,role:"helper",appIds:[scope.appId],environments:["sandbox"]};await expect(exportCodes(store,helper,scope,"csv",true,now)).rejects.toThrow("forbidden");await expect(getLicenseMetrics(store,helper,{...scope,environment:"live"},now)).rejects.toThrow("forbidden");
});
it("backs up encrypted rows, validates before restore, and refuses a nonempty target",async()=>{
 const backup=await captureBackup(store,owner,now);expect(backup.version).toBe("keygate.backup.v1");expect(JSON.stringify(backup)).not.toContain("isolated-reporting-test-material");
 const second=await startTestPostgres();try{const target=createLicenseStore(second.url,second.pool);expect(await restoreBackup(target,backup,"validate")).toMatchObject({applied:false});expect(await restoreBackup(target,backup,"apply")).toMatchObject({applied:true});expect((await second.pool.query("SELECT count(*) FROM access_licenses")).rows[0].count).toBe("1");await expect(restoreBackup(target,backup,"apply")).rejects.toThrow("restore_target_not_empty");}finally{await second.stop();}
},60000);
it("workspace lists never expose live records to a sandbox-only principal", async () => {
 const live = {...scope, environment:"live" as const};
 const [code] = await issueCodes(store,owner,live,{type:"lifetime",count:1});
 await redeemCode(store,live,{code:code.key,binding:{deviceId:"live-report-installation"}},"live-report-request",now);
 const restricted:Principal={kind:"api",id:"sandbox-reports",appIds:[scope.appId],environments:["sandbox"],capabilities:["codes.read","licenses.read","activity.read"]};
 expect((await codePage(store,restricted,null)).items.every(row=>row.environment==="sandbox")).toBe(true);
 expect((await accessPage(store,restricted,null)).items.every(row=>row.environment==="sandbox")).toBe(true);
 expect((await activityPage(store,restricted)).every(row=>row.environment!=="live")).toBe(true);
 await expect(getLicenseMetrics(store,restricted,null,now,"live")).rejects.toThrow("forbidden");
});
