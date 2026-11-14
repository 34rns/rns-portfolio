import { z } from "zod";
const flowSchema=z.object({return_uri:z.url().max(2000),device_id:z.string().min(8).max(256),pkce_challenge:z.string().regex(/^[A-Za-z0-9_-]{43}$/),state:z.string().regex(/^[A-Za-z0-9_-]{16,128}$/)}).strict();
export type ReturnFlow={returnUri:string;deviceId:string;challenge:string;state:string};
export function parseReturnFlow(input:unknown,allowedOrigins:string[]):ReturnFlow {
 const value=flowSchema.parse(input),url=new URL(value.return_uri);
 if(!["http:","https:"].includes(url.protocol)||url.username||url.password||url.hash||!allowedOrigins.includes(url.origin))throw new Error("Return to an approved app origin only.");
 return {returnUri:url.href,deviceId:value.device_id,challenge:value.pkce_challenge,state:value.state};
}
