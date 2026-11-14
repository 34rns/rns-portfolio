import { verifyRequestLicense,type GateOptions } from "./index";
export function requireLicense(options:GateOptions){return async(context:{req:{raw:Request};json:(body:unknown,status:403)=>Response},next:()=>Promise<void>)=>{if(!await verifyRequestLicense(context.req.raw,options))return context.json({code:"license_required"},403);await next();};}
