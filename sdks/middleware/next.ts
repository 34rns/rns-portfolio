import { verifyRequestLicense,type GateOptions } from "./index";
export function requireLicense(options:GateOptions,handler:(request:Request)=>Promise<Response>){return async(request:Request)=>await verifyRequestLicense(request,options)?handler(request):Response.json({code:"license_required"},{status:403,headers:{"cache-control":"no-store"}});}
