import { spawn } from "node:child_process";
import { randomBytes,generateKeyPairSync } from "node:crypto";
import { mkdirSync,writeFileSync } from "node:fs";
import path from "node:path";
import { startTestPostgres } from "../../tests/helpers/licensing-postgres";
import { hashPassword } from "../../src/lib/auth/password";
async function main(){
 const runtime=await startTestPostgres();
 const variables={DATABASE_URL:runtime.url,LICENSE_DATABASE_URL:runtime.url,AUTH_SECRET:randomBytes(32).toString("hex"),LICENSE_SECRET:randomBytes(32).toString("hex"),LICENSE_TOKEN_PRIVATE_KEY:generateKeyPairSync("ed25519").privateKey.export({format:"der",type:"pkcs8"}).toString("base64"),LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS:"",ADMIN_EMAIL:"owner@example.test",ADMIN_PASSWORD_HASH:await hashPassword("Local-preview-password-2026"),AUTH_URL:"http://localhost:8787",NEXT_PUBLIC_SITE_URL:"http://localhost:8787",KEYGATE_ISSUER:"http://localhost:8787",STORAGE_PROVIDER:"local",BLOB_READ_WRITE_TOKEN:"",SITE_SETTINGS_DRIVER:"database",LICENSE_STAFF_ENABLED:"false",PAYMENT_PROVIDER:"manual"};
 mkdirSync(".local/cloudflare-preview",{recursive:true});
 writeFileSync(".local/cloudflare-preview/.dev.vars",Object.entries(variables).map(([key,value])=>`${key}=${JSON.stringify(value)}`).join("\n"));
 writeFileSync(".local/cloudflare-preview/wrangler.json",JSON.stringify({name:"rns-portfolio-preview",main:path.resolve(".open-next/worker.js"),compatibility_date:"2026-11-14",compatibility_flags:["nodejs_compat","global_fetch_strictly_public"],assets:{directory:path.resolve(".open-next/assets"),binding:"ASSETS"},r2_buckets:[{binding:"NEXT_INC_CACHE_R2_BUCKET",bucket_name:"preview-cache"}]}));
 const child=spawn(process.execPath,[path.resolve("node_modules/wrangler/bin/wrangler.js"),"dev","--config",path.resolve(".local/cloudflare-preview/wrangler.json"),"--port","8787","--local"],{env:{...process.env,WRANGLER_SEND_METRICS:"false"},stdio:"inherit",windowsHide:true});
 let stopping=false;const stop=async()=>{if(stopping)return;stopping=true;child.kill();await runtime.stop();};process.on("SIGINT",()=>void stop());process.on("SIGTERM",()=>void stop());child.on("exit",()=>void stop());
}
void main().catch(()=>{process.stderr.write("Isolated Cloudflare preview could not start.\n");process.exitCode=1;});
