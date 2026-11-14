export type Environment="sandbox"|"live";
export type Access={licenseId:string;appId:string;environment:Environment;status:"active";planKey:string;features:{key:string;expiresAt:string|null}[];expiresAt:string|null;revision:number;deviceId:string};
export type StoredAccess={deviceId:string;token:string|null;activationKey:string|null;lastSeenAt:number};
export type Storage={read():Promise<StoredAccess|null>;write(value:StoredAccess):Promise<void>;clear():Promise<void>};
export class KeyGateError extends Error{constructor(public code:string){super(code);}}
export type ClientOptions={appId:string;environment:Environment;apiUrl:string;issuer?:string;deviceId?:string;storage:Storage;clock?:()=>number;fetch?:(url:string,init?:RequestInit)=>Promise<Response>};
type Claims={v:string;iss:string;aud:string;env:Environment;kid:string;sub:string;dev:string;plan:string;features:{key:string;expiresAt:string|null}[];iat:number;exp:number;refresh_after:number;offline_until:number;le:string|null;rev:number};
type PublicKey=JsonWebKey&{kid:string};
const decode=(value:string)=>{if(!/^[A-Za-z0-9_-]+$/.test(value))throw new KeyGateError("invalid_token");return Uint8Array.from(atob(value.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));};
const encode=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
export function createKeyGateClient(options:ClientOptions){
 const {appId,environment,storage}=options,clock=options.clock??Date.now,fetcher=options.fetch??globalThis.fetch,apiUrl=options.apiUrl.replace(/\/$/,""),expectedIssuer=options.issuer??apiUrl.replace(/\/(?:api\/)?v1$/,"");
 if(!/^[a-f0-9-]{36}$/i.test(appId)||!["sandbox","live"].includes(environment)||!/^https?:$/.test(new URL(apiUrl).protocol))throw new KeyGateError("invalid_configuration");
 let initialized:Promise<StoredAccess>|null=null,keys:PublicKey[]=[];
 const read=async()=>{try{const stored=await storage.read();if(!stored||typeof stored.deviceId!=="string"||stored.deviceId.length<8||!Number.isFinite(stored.lastSeenAt))throw new Error();return stored;}catch{throw new KeyGateError("storage_unavailable");}};
 const write=async(value:StoredAccess)=>{try{await storage.write(value);}catch{throw new KeyGateError("storage_unavailable");}};
 const initialize=()=>initialized??= (async()=>{let stored:StoredAccess|null;try{stored=await storage.read();}catch{throw new KeyGateError("storage_unavailable");}if(stored)return read();const created={deviceId:options.deviceId??crypto.randomUUID(),token:null,activationKey:null,lastSeenAt:clock()};await write(created);return created;})();
 const loadKeys=async()=>{const response=await fetcher(`${apiUrl}/public-key`,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new KeyGateError("invalid_key");const data=await response.json();if(!Array.isArray(data.keys)||data.keys.length>10)throw new KeyGateError("invalid_key");keys=data.keys;};
 const verifyToken=async(token:string,deviceId:string):Promise<Claims>=>{
  try{
   if(!globalThis.crypto?.subtle)throw new KeyGateError("crypto_unavailable");if(token.length>16000)throw new Error();const parts=token.split(".");if(parts.length!==3)throw new Error();
   const header=JSON.parse(new TextDecoder().decode(decode(parts[0])));if(header.alg!=="EdDSA"||header.typ!=="JWT"||typeof header.kid!=="string")throw new Error();let key=keys.find(k=>k.kid===header.kid);if(!key){await loadKeys();key=keys.find(k=>k.kid===header.kid);}if(!key||key.kty!=="OKP"||key.crv!=="Ed25519")throw new Error();
   const imported=await crypto.subtle.importKey("jwk",key,{name:"Ed25519"},false,["verify"]);if(!(await crypto.subtle.verify({name:"Ed25519"},imported,decode(parts[2]),new TextEncoder().encode(`${parts[0]}.${parts[1]}`))))throw new Error();
   const claims=JSON.parse(new TextDecoder().decode(decode(parts[1]))) as Claims;
   if(claims.v!=="keygate.v1"||claims.iss!==expectedIssuer||claims.aud!==appId||claims.env!==environment||claims.kid!==header.kid||typeof claims.sub!=="string"||!/^\w[\w-]*$/.test(claims.plan)||!Number.isInteger(claims.rev)||claims.rev<1||![claims.iat,claims.exp,claims.offline_until,claims.refresh_after].every(Number.isFinite)||claims.exp!==claims.offline_until||claims.exp<claims.iat||!Array.isArray(claims.features)||claims.features.length>100||claims.features.some(f=>!f||typeof f.key!=="string"||!/^[a-z][a-z0-9_-]{0,63}$/.test(f.key)||f.expiresAt!==null&&!Number.isFinite(Date.parse(f.expiresAt))))throw new Error();
   const fingerprint=encode(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(deviceId)))).slice(0,22);if(claims.dev!==fingerprint||claims.iat>clock()/1000+30)throw new Error();
   if(claims.exp*1000<=clock())throw new KeyGateError("expired");return claims;
  }catch(error){if(error instanceof KeyGateError)throw error;throw new KeyGateError("invalid_token");}
 };
 const accessOf=(claims:Claims,deviceId:string):Access=>({licenseId:claims.sub,appId,environment,status:"active",planKey:claims.plan,features:claims.features.filter(f=>!f.expiresAt||Date.parse(f.expiresAt)>clock()),expiresAt:claims.le,revision:claims.rev,deviceId});
 const cached=async()=>{await initialize();const state=await read();if(clock()<state.lastSeenAt-30000)throw new KeyGateError("clock_rollback");if(!state.token)throw new KeyGateError("locked");const claims=await verifyToken(state.token,state.deviceId);await write({...state,lastSeenAt:Math.max(state.lastSeenAt,clock())});return accessOf(claims,state.deviceId);};
 const post=async(path:string,fields:Record<string,unknown>,idempotency?:string)=>{
  await initialize();const state=await read();if(clock()<state.lastSeenAt-30000)throw new KeyGateError("clock_rollback");let response:Response;
  try{response=await fetcher(`${apiUrl}/${path}`,{method:"POST",headers:{"content-type":"application/json",...(idempotency?{"idempotency-key":idempotency}:{})},body:JSON.stringify({app_id:appId,environment,device_id:state.deviceId,...fields}),signal:AbortSignal.timeout(10000)});}catch{throw new KeyGateError("network_unavailable");}
  let result:Record<string,unknown>;try{result=await response.json();}catch{throw new KeyGateError("invalid_response");}
  if(!response.ok){await write({...state,token:null,lastSeenAt:Math.max(clock(),state.lastSeenAt)});throw new KeyGateError(typeof result.code==="string"?result.code:"access_rejected");}return result;
 };
 const save=async(result:Record<string,unknown>,activation?:string)=>{const state=await read();if(typeof result.token!=="string")throw new KeyGateError("invalid_response");const claims=await verifyToken(result.token,state.deviceId);await write({...state,token:result.token,activationKey:activation??(typeof result.activationKey==="string"?result.activationKey:state.activationKey),lastSeenAt:Math.max(clock(),state.lastSeenAt)});return accessOf(claims,state.deviceId);};
 return {
  async redeem(code:string){await initialize();const state=await read();return save(await post("redeem",{code,...(state.activationKey?{activation_key:state.activationKey}:{})},crypto.randomUUID()));},
  async activate(key:string){return save(await post("activate",{activation_key:key}),key);},
  async validate(){await initialize();const state=await read();if(!state.token)throw new KeyGateError("locked");try{return await save(await post("validate",{token:state.token}));}catch(error){if(error instanceof KeyGateError&&error.code==="network_unavailable")return cached();throw error;}},
  async validateOnline(){await initialize();const state=await read();if(!state.token)throw new KeyGateError("locked");return save(await post("validate",{token:state.token}));},
  async deactivate(){await initialize();const state=await read();if(state.token)await post("deactivate",{token:state.token});await write({...state,token:null,lastSeenAt:Math.max(clock(),state.lastSeenAt)});},
  async can(featureKey:string){try{const access=await cached();return access.features.some(feature=>feature.key===featureKey);}catch{return false;}},
  getAccess:cached,
 };
}
