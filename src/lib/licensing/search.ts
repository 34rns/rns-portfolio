import type { Principal } from "./contracts";
import type { AppStore } from "./transaction-store";
import { assertCapability } from "../auth/permissions";
export type SearchResult={href:string;label:string;kind:string};
export async function searchRecords(store:AppStore,principal:Principal,query:string):Promise<SearchResult[]>{
 assertCapability(principal,"apps.read");const term=query.trim().slice(0,100);if(term.length<2)return [];
 return store.read(async tx=>{
  const params=[`%${term}%`,principal.role==="owner"?null:principal.appIds,principal.environments];
  const apps=await tx.query<{id:string;name:string}>("SELECT id,name FROM license_apps WHERE (name ILIKE $1 OR slug ILIKE $1) AND ($2::uuid[] IS NULL OR id=ANY($2)) ORDER BY name LIMIT 5",params.slice(0,2));
  const codes=await tx.query<{id:string;app_id:string;environment:string;masked:string}>("SELECT id,app_id,environment,masked FROM redeem_codes WHERE (masked ILIKE $1 OR note ILIKE $1) AND ($2::uuid[] IS NULL OR app_id=ANY($2)) AND environment=ANY($3::text[]) ORDER BY created_at DESC LIMIT 5",params);
  const access=await tx.query<{id:string;app_id:string;environment:string;subject:string|null}>("SELECT id,app_id,environment,subject FROM access_licenses WHERE (id::text ILIKE $1 OR subject ILIKE $1 OR note ILIKE $1) AND ($2::uuid[] IS NULL OR app_id=ANY($2)) AND environment=ANY($3::text[]) ORDER BY created_at DESC LIMIT 5",params);
  return [...apps.map(a=>({href:`/admin/apps/${a.id}`,label:a.name,kind:"Product"})),...codes.map(c=>({href:`/admin/apps/${c.app_id}/codes/${c.id}?environment=${c.environment}`,label:c.masked,kind:`Code · ${c.environment}`})),...access.map(l=>({href:`/admin/apps/${l.app_id}/access/${l.id}?environment=${l.environment}`,label:l.subject??l.id.slice(0,8),kind:`Access · ${l.environment}`}))];
 });
}
