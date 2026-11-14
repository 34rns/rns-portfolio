import { appInputSchema, LicenseDomainError, type AppInput, type Principal } from "./contracts";
import { assertCapability } from "../auth/permissions";
import { randomUUID } from "node:crypto";
import type { AppStore } from "./transaction-store";
export type LicenseApp={id:string;name:string;slug:string;config:AppInput;archived_at:Date|null;created_at:Date};
import type { SqlExecutor } from "./transaction-store";
export async function audit(tx:SqlExecutor,principal:Principal,action:string,appId:string|null,targetId:string|null,detail:Record<string,unknown>={},environment:string|null=null){
  await tx.query("INSERT INTO admin_audit_events(actor_id,action,app_id,target_id,detail,environment) VALUES($1,$2,$3,$4,$5,$6)",[principal.id,action,appId,targetId,JSON.stringify(detail),environment]);
}
async function syncPlans(tx:SqlExecutor,appId:string,input:AppInput){
  await tx.query("DELETE FROM license_plan_features WHERE plan_id IN (SELECT id FROM license_plans WHERE app_id=$1)",[appId]);
  await tx.query("DELETE FROM license_plans WHERE app_id=$1",[appId]);await tx.query("DELETE FROM license_features WHERE app_id=$1",[appId]);
  const features=new Map<string,string>();
  for(const feature of input.features){const fid=randomUUID();features.set(feature.key,fid);await tx.query("INSERT INTO license_features(id,app_id,key,name,description) VALUES($1,$2,$3,$4,$5)",[fid,appId,feature.key,feature.name,feature.description]);}
  for(const plan of input.plans){const pid=randomUUID();await tx.query("INSERT INTO license_plans(id,app_id,key,name,priority) VALUES($1,$2,$3,$4,$5)",[pid,appId,plan.key,plan.name,plan.priority]);for(const key of plan.featureKeys)await tx.query("INSERT INTO license_plan_features(plan_id,feature_id) VALUES($1,$2)",[pid,features.get(key)]);}
}
export async function createApp(store:AppStore,principal:Principal,input:unknown):Promise<LicenseApp>{
  assertCapability(principal,"apps.create");const config=appInputSchema.parse(input);
  return store.transaction(async tx=>{
    if(config.linkedProjectId && !(await tx.query("SELECT id FROM projects WHERE id=$1",[config.linkedProjectId])).length)throw new LicenseDomainError("invalid_project");
    const [app]=await tx.query<LicenseApp>("INSERT INTO license_apps(name,slug,linked_project_id,config) VALUES($1,$2,$3,$4) RETURNING *",[config.name,config.slug,config.linkedProjectId,JSON.stringify(config)]);
    await syncPlans(tx,app.id,config);await audit(tx,principal,"app.created",app.id,app.id);return app;
  });
}
export async function saveApp(store:AppStore,principal:Principal,id:string,input:unknown):Promise<LicenseApp>{
  assertCapability(principal,"apps.write",{appId:id,environment:"live"});const config=appInputSchema.parse(input);
  return store.transaction(async tx=>{
    const [existing]=await tx.query<LicenseApp>("SELECT * FROM license_apps WHERE id=$1 FOR UPDATE",[id]);if(!existing)throw new LicenseDomainError("not_found",404);
    if(config.linkedProjectId && !(await tx.query("SELECT id FROM projects WHERE id=$1",[config.linkedProjectId])).length)throw new LicenseDomainError("invalid_project");
    const [app]=await tx.query<LicenseApp>("UPDATE license_apps SET name=$2,slug=$3,linked_project_id=$4,config=$5,updated_at=now() WHERE id=$1 RETURNING *",[id,config.name,config.slug,config.linkedProjectId,JSON.stringify(config)]);
    await syncPlans(tx,id,config);await audit(tx,principal,"app.updated",id,id);return app;
  });
}
export async function readApp(tx:SqlExecutor,id:string,lock=false):Promise<LicenseApp>{const [app]=await tx.query<LicenseApp>(`SELECT * FROM license_apps WHERE id=$1${lock?" FOR UPDATE":""}`,[id]);if(!app)throw new LicenseDomainError("not_found",404);return app;}
export async function listApps(store:AppStore,principal:Principal):Promise<LicenseApp[]>{return store.read(tx=>principal.role==="owner"?tx.query<LicenseApp>("SELECT * FROM license_apps ORDER BY created_at DESC"):tx.query<LicenseApp>("SELECT * FROM license_apps WHERE id=ANY($1::uuid[]) ORDER BY created_at DESC",[principal.appIds]));}
export async function archiveApp(store:AppStore,principal:Principal,id:string){assertCapability(principal,"apps.write",{appId:id,environment:"live"});await store.transaction(async tx=>{await tx.query("UPDATE license_apps SET archived_at=CASE WHEN archived_at IS NULL THEN now() ELSE NULL END WHERE id=$1",[id]);await audit(tx,principal,"app.archive_changed",id,id);});}
