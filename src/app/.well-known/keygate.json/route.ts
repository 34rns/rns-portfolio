import { publicJwks,issuer } from "@/lib/licensing/v1-token";
export async function GET(){return Response.json({issuer:issuer(),api:`${issuer()}/v1`,jwks_uri:`${issuer()}/v1/public-key`,...publicJwks()},{headers:{"cache-control":"public,max-age=300","access-control-allow-origin":"*"}});}
