import { createPublicKey,sign,verify } from "node:crypto";
import { z } from "zod";
import { LicenseDomainError,environmentSchema,keySchema,type AccessSnapshot,type AppInput,type AppScope,type AccessResponse } from "./contracts";
import { signingKeys,deviceFingerprint } from "./token";
import { siteUrl } from "../seo";
export const issuer=()=> (process.env.KEYGATE_ISSUER??siteUrl()).replace(/\/$/,"");
const claimSchema=z.object({v:z.literal("keygate.v1"),src:z.enum(["app","legacy"]).default("app"),iss:z.string(),aud:z.uuid(),env:environmentSchema,kid:z.string(),sub:z.uuid(),dev:z.string(),plan:keySchema,features:z.array(z.object({key:keySchema,expiresAt:z.iso.datetime().nullable()})).max(100),iat:z.number().int().nonnegative(),exp:z.number().int().nonnegative(),refresh_after:z.number().int(),offline_until:z.number().int(),le:z.iso.datetime().nullable(),rev:z.number().int().min(1)}).strict();
export function signAccessToken(access:AccessSnapshot,now:Date,policy:Pick<AppInput,"offlineHours"|"expiryGraceHours">):AccessResponse{
 if(access.status!=="active")return {access,token:null,refreshAfter:null,offlineUntil:null};
 const [key]=signingKeys();if(!key)throw new Error("Signing keys are not configured");
 const iat=Math.floor(now.getTime()/1000),offline=Math.min(iat+policy.offlineHours*3600,access.expiresAt?Math.floor(new Date(access.expiresAt).getTime()/1000)+policy.expiryGraceHours*3600:Infinity);
 const refresh=Math.min(iat+86400,offline),claims=claimSchema.parse({v:"keygate.v1",src:access.source,iss:issuer(),aud:access.appId,env:access.environment,kid:key.kid,sub:access.licenseId,dev:deviceFingerprint(access.deviceId),plan:access.planKey,features:access.features,iat,exp:offline,refresh_after:refresh,offline_until:offline,le:access.expiresAt,rev:access.revision});
 const header=Buffer.from(JSON.stringify({alg:"EdDSA",typ:"JWT",kid:key.kid})).toString("base64url"),body=Buffer.from(JSON.stringify(claims)).toString("base64url"),signature=sign(null,Buffer.from(`${header}.${body}`),key.privateKey).toString("base64url");
 return {access,token:`${header}.${body}.${signature}`,refreshAfter:new Date(refresh*1000).toISOString(),offlineUntil:new Date(offline*1000).toISOString()};
}
export function verifyAccessToken(token:string,scope:AppScope,device:string,now:Date,onlineProof=false):AccessSnapshot{
 try{
  if(token.length>16000)throw new Error();const parts=token.split(".");if(parts.length!==3||parts.some(p=>!p||!/^[A-Za-z0-9_-]+$/.test(p)))throw new Error();
  const [header,body,signature]=parts,parsed=JSON.parse(Buffer.from(header,"base64url").toString());if(parsed.alg!=="EdDSA"||parsed.typ!=="JWT")throw new Error();const key=signingKeys().find(k=>k.kid===parsed.kid);
  if(!key||!verify(null,Buffer.from(`${header}.${body}`),createPublicKey(key.privateKey),Buffer.from(signature,"base64url")))throw new Error();
  const claims=claimSchema.parse(JSON.parse(Buffer.from(body,"base64url").toString())),seconds=now.getTime()/1000;
  if(claims.iss!==issuer()||claims.aud!==scope.appId||claims.env!==scope.environment||claims.kid!==parsed.kid||claims.dev!==deviceFingerprint(device)||claims.iat>seconds+30||claims.exp!==claims.offline_until||claims.exp<claims.iat||(!onlineProof&&claims.exp<=seconds))throw new Error();
  return {licenseId:claims.sub,source:claims.src,appId:claims.aud,environment:claims.env,status:"active",planKey:claims.plan,features:claims.features.filter(f=>!f.expiresAt||new Date(f.expiresAt)>now),expiresAt:claims.le,revision:claims.rev,deviceId:device};
 }catch{throw new LicenseDomainError("invalid_token",401);}
}
export function publicJwks(){return {keys:signingKeys().map(k=>({...createPublicKey(k.privateKey).export({format:"jwk"}),kid:k.kid,alg:"EdDSA",use:"sig"}))};}
