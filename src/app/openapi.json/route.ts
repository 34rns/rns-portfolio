import { openapi } from "@/lib/licensing/openapi";
export async function GET(){return Response.json(openapi,{headers:{"cache-control":"public,max-age=300"}});}
