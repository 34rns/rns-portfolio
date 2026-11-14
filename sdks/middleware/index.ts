import { createKeyGateClient,type StoredAccess,type Environment } from "../javascript/src/index";
export type GateOptions={appId:string;environment:Environment;apiUrl:string;issuer?:string;featureKey?:string};
export async function verifyRequestLicense(request:Request,options:GateOptions):Promise<boolean>{
 const authorization=request.headers.get("authorization"),deviceId=request.headers.get("x-keygate-device");if(!authorization?.startsWith("Bearer ")||!deviceId)return false;
 let stored:StoredAccess|null={deviceId,token:authorization.slice(7),activationKey:null,lastSeenAt:0};
 const client=createKeyGateClient({...options,storage:{read:async()=>stored,write:async value=>{stored=value;},clear:async()=>{stored=null;}}});
 try{const access=await client.validateOnline();return !options.featureKey||access.features.some(f=>f.key===options.featureKey);}catch{return false;}
}
