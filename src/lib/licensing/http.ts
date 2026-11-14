import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getLicenseStore,type AppStore } from "./transaction-store";
import { LicenseDomainError,environmentSchema,redeemInputSchema,type AppScope } from "./contracts";
import { readApp } from "./apps";
import { normalizeLicenseKey } from "./keys";
import { activateLegacy, inspectLegacy, deactivateLegacy } from "./legacy-bridge";
import { redeemCode,activateExistingLicense,inspectAccess,deactivateDevice } from "./access";
import { signAccessToken,verifyAccessToken,issuer,publicJwks } from "./v1-token";
import { authenticateAppKey } from "./api-keys";
import { resolveBinding } from "./identity";
import { lookupHash } from "../security/secrets";
import { checkSharedLimit,checkRedeemFailures,recordRedeemFailure,RateLimitError } from "./shared-limits";
const scopeSchema=z.object({app_id:z.uuid(),environment:environmentSchema});
export const proofSchema=scopeSchema.extend({device_id:z.string().min(8).max(256),token:z.string().min(1).max(16000)}).strict();
export const activateSchema=scopeSchema.extend({device_id:z.string().min(8).max(256),activation_key:z.string().min(20).max(128).optional(),user_id:z.string().min(1).max(256).optional()}).strict();
export function trustedClientAddress(headers:Headers){
 if(process.env.KEYGATE_TRUSTED_PROXY==="cloudflare" && process.env.CF_WORKER_CONTEXT==="true")return headers.get("cf-connecting-ip")??"unknown";
 if(process.env.VERCEL==="1")return headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()??"unknown";
 return "shared-untrusted";
}
export async function readBoundedJson(request:Request,max=24000):Promise<unknown>{
 if(!request.headers.get("content-type")?.startsWith("application/json"))throw new LicenseDomainError("invalid_body");
 if(Number(request.headers.get("content-length"))>max)throw new LicenseDomainError("body_too_large",413);
 const reader=request.body?.getReader();if(!reader)throw new LicenseDomainError("invalid_body");let size=0;const chunks:Uint8Array[]=[];
 while(true){const result=await reader.read();if(result.done)break;size+=result.value.byteLength;if(size>max){await reader.cancel();throw new LicenseDomainError("body_too_large",413);}chunks.push(result.value);}
 try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw new LicenseDomainError("invalid_body");}
}
export async function handleV1(request:Request,segments:string[],store:AppStore=getLicenseStore()):Promise<Response>{
 const requestId=randomUUID(),headers:Record<string,string>={"cache-control":"no-store","x-request-id":requestId,"vary":"Origin"};let failureKey:string|undefined;
 try{
  const path=segments.join("/");if(path==="public-key"&&request.method==="GET"){headers["access-control-allow-origin"]="*";return Response.json(publicJwks(),{headers});}
  if(segments[0]==="admin")return (await import("./admin-http")).handleAdminV1(request,segments.slice(1),store);
  if(!["app","ticket","exchange","redeem","activate","validate","status","deactivate"].includes(path))throw new LicenseDomainError("not_found",404);
  const raw=request.method==="OPTIONS"||path==="app"&&request.method==="GET"?Object.fromEntries(new URL(request.url).searchParams):await readBoundedJson(request);
  const parsedScope=scopeSchema.parse(raw),scope:AppScope={appId:parsedScope.app_id,environment:parsedScope.environment};
  const app=await store.read(tx=>readApp(tx,scope.appId));if(app.archived_at)throw new LicenseDomainError("app_archived",410);
  const origin=request.headers.get("origin"),allowed=[...app.config.allowedOrigins,new URL(issuer()).origin];
  if(origin&&!allowed.includes(origin))throw new LicenseDomainError("origin_denied",403);
  if(origin)Object.assign(headers,{"access-control-allow-origin":origin,"access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"content-type,idempotency-key,authorization","access-control-max-age":"600"});
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(path==="app"&&request.method==="GET")return Response.json({appId:scope.appId,environment:scope.environment,name:app.name,branding:app.config.branding,bindingMode:app.config.bindingMode,lockBehavior:app.config.lockBehavior,lockMessage:app.config.lockMessage,offlineHours:app.config.offlineHours,features:app.config.features},{headers});
  if(request.method!=="POST")throw new LicenseDomainError("method_not_allowed",405);
  const ip=lookupHash(`ip:${trustedClientAddress(request.headers)}`),now=new Date();
  await checkSharedLimit(store,`v1:ip:${ip}`,60,60,now);
  if(path==="ticket"||path==="exchange"){
   const tickets=await import("./redeem-ticket");
   if(path==="ticket"){const input=proofSchema.extend({return_origin:z.url().max(500),pkce_challenge:z.string().regex(/^[A-Za-z0-9_-]{43}$/)}).strict().parse(raw);return Response.json(await tickets.issueReturnTicket(store,scope,{token:input.token,deviceId:input.device_id,origin:input.return_origin,pkceChallenge:input.pkce_challenge},now),{headers});}
   const input=scopeSchema.extend({ticket:z.string().max(100),device_id:z.string().min(8).max(256),return_origin:z.url().max(500),pkce_verifier:z.string().max(128)}).strict().parse(raw);return Response.json(await tickets.exchangeReturnTicket(store,scope,{ticket:input.ticket,deviceId:input.device_id,origin:input.return_origin,pkceVerifier:input.pkce_verifier},now),{headers});
  }
  if(path==="redeem"||path==="activate"){
   const input=path==="redeem"?redeemInputSchema.parse(raw):activateSchema.parse(raw);
   await checkSharedLimit(store,`v1:device:${scope.appId}:${scope.environment}:${lookupHash(input.device_id)}`,30,60,now);
   failureKey=`v1:fail:${scope.appId}:${scope.environment}:${ip}`;await checkRedeemFailures(store,failureKey,now);
   const secret=request.headers.get("authorization")?.replace(/^Bearer /,"");
   const principal=input.user_id&&secret?await authenticateAppKey(store,scope,secret,"identity.write",now):undefined;
   const binding=await resolveBinding(store,scope,input.device_id,input.user_id,principal);
   const legacyKey=path==="redeem"?(input as z.infer<typeof redeemInputSchema>).code:(input as z.infer<typeof activateSchema>).activation_key;
   if(normalizeLicenseKey(legacyKey)){
    if(path==="redeem"&&!request.headers.get("idempotency-key"))throw new LicenseDomainError("idempotency_required");
    const result=await activateLegacy(store,scope,legacyKey!,input.device_id,now);
    return Response.json({...signAccessToken(result.access,now,app.config),activationKey:result.activationKey},{headers});
   }
   if(path==="activate"){
    const access=await activateExistingLicense(store,scope,binding,(input as z.infer<typeof activateSchema>).activation_key,now);return Response.json(signAccessToken(access,now,app.config),{headers});
   }
   const redeem=input as z.infer<typeof redeemInputSchema>;
   await checkSharedLimit(store,`v1:code:${scope.appId}:${scope.environment}:${lookupHash(redeem.code.trim().toUpperCase())}`,30,60,now);
   const result=await redeemCode(store,scope,{code:redeem.code,binding,activationKey:redeem.activation_key},request.headers.get("idempotency-key")??"",now);
   return Response.json({...signAccessToken(result.access,now,app.config),...(result.activationKey?{activationKey:result.activationKey}:{})},{headers});
  }
  const input=proofSchema.parse(raw),proof=verifyAccessToken(input.token,scope,input.device_id,now,true);
  const access=proof.source==="legacy"?await inspectLegacy(store,scope,proof.licenseId,input.device_id,now):await inspectAccess(store,scope,proof.licenseId,input.device_id,now,proof.revision);
  if(access.status!=="active")throw new LicenseDomainError(access.status,403);
  if(path==="deactivate"){if(proof.source==="legacy")await deactivateLegacy(store,scope,access.licenseId,input.device_id);else await deactivateDevice(store,scope,access.licenseId,input.device_id,now);return Response.json({ok:true},{headers});}
  return Response.json(signAccessToken(access,now,app.config),{headers});
 }catch(error){
  if(failureKey && error instanceof LicenseDomainError && ["invalid_code","code_exhausted","redeem_deadline","identity_required","unauthorized"].includes(error.code))await recordRedeemFailure(store,failureKey,new Date()).catch(()=>{});
  const status=error instanceof LicenseDomainError?error.status:error instanceof z.ZodError?400:503,code=error instanceof LicenseDomainError?error.code:error instanceof z.ZodError?"invalid_body":"storage_unavailable";
  if(error instanceof RateLimitError)headers["retry-after"]=String(error.retryAfterSeconds);
  return Response.json({ok:false,code,requestId,...(error instanceof RateLimitError?{retryAfterSeconds:error.retryAfterSeconds}:{})},{status,headers});
 }
}
