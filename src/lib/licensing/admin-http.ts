import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { AppStore } from "./transaction-store";
import { LicenseDomainError,type Principal } from "./contracts";
import { readBoundedJson } from "./http";
import { parseScope } from "./admin-commands";
import { authenticateAppKey } from "./api-keys";
import { listApps } from "./apps";
import { codePage,accessPage,activityPage } from "./admin-data";
import { siteUrl } from "../seo";
import { searchRecords } from "./search";
import { runJournaledCommand } from "./command-journal";
export async function handleAdminV1(request:Request,path:string[],store:AppStore):Promise<Response>{const requestId=randomUUID(),headers={"cache-control":"no-store","x-request-id":requestId};try{
 const url=new URL(request.url),scope=url.searchParams.has("app_id")?parseScope({appId:url.searchParams.get("app_id"),environment:url.searchParams.get("environment")}):undefined,authorization=request.headers.get("authorization");let principal:Principal;
 if(authorization){if(!scope||!authorization.startsWith("Bearer "))throw new LicenseDomainError("unauthorized",401);const command=path.join("/"),capability=request.method==="GET"?({apps:"apps.read",codes:"codes.read",access:"licenses.read",activity:"activity.read",search:"apps.read"}[command]??null):null;principal=await authenticateAppKey(store,scope,authorization.slice(7),capability,new Date());}
 else {const origin=request.headers.get("origin");if(request.method!=="GET"&&origin!==new URL(siteUrl()).origin)throw new LicenseDomainError("origin_denied",403);principal=await (await import("../auth/principal")).requirePrincipal();}
 const resource=path.join("/");if(request.method==="GET"){
  const filter={page:url.searchParams.get("page"),query:url.searchParams.get("q")??"",status:url.searchParams.get("status")??"all"};
  const data=resource==="search"?await searchRecords(store,principal,filter.query):resource==="apps"?await listApps(store,principal):resource==="codes"?await codePage(store,principal,scope??null,filter):resource==="access"?await accessPage(store,principal,scope??null,filter):resource==="activity"?await activityPage(store,principal,filter.page):null;
  if(data===null)throw new LicenseDomainError("not_found",404);return Response.json(data,{headers});
 }
 if(request.method!=="POST")throw new LicenseDomainError("method_not_allowed",405);
 const data=await readBoundedJson(request,6*1024*1024),key=request.headers.get("idempotency-key");if(!key)throw new LicenseDomainError("idempotency_required");const result=await runJournaledCommand(store,principal,resource,scope,data,key);return Response.json({ok:true,value:result??null},{headers});
 }catch(error){const status=error instanceof LicenseDomainError?error.status:error instanceof z.ZodError?400:503,code=error instanceof LicenseDomainError?error.code:error instanceof z.ZodError?"invalid_body":"storage_unavailable";return Response.json({ok:false,code,requestId},{status,headers});}}
