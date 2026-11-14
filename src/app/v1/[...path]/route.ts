import { handleV1 } from "@/lib/licensing/http";
const handler=async(request:Request,context:{params:Promise<{path:string[]}>})=>handleV1(request,(await context.params).path);
export const POST=handler;
export const GET=handler;
export const OPTIONS=handler;
