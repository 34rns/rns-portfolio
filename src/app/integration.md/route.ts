import { integrationDoc } from "@/lib/licensing/integration-doc";
export async function GET(){return new Response(integrationDoc,{headers:{"content-type":"text/markdown; charset=utf-8","cache-control":"public,max-age=300"}});}
