import { spawn } from "node:child_process";
import path from "node:path";
import { randomBytes,generateKeyPairSync } from "node:crypto";
import { startTestPostgres } from "../../tests/helpers/licensing-postgres";
import { build } from "esbuild";
async function main(){
 const runtime=await startTestPostgres();
 const env={...process.env,DATABASE_URL:runtime.url,LICENSE_DATABASE_URL:runtime.url,AUTH_SECRET:randomBytes(32).toString("hex"),LICENSE_SECRET:randomBytes(32).toString("hex"),LICENSE_TOKEN_PRIVATE_KEY:generateKeyPairSync("ed25519").privateKey.export({format:"der",type:"pkcs8"}).toString("base64"),LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS:"",ADMIN_EMAIL:"owner@example.test",ADMIN_PASSWORD_HASH:"",BLOB_READ_WRITE_TOKEN:"",AUTH_URL:"http://localhost:3100",NEXT_PUBLIC_SITE_URL:"http://localhost:3100",KEYGATE_ISSUER:"http://localhost:3100",STORAGE_PROVIDER:"local",PAYMENT_PROVIDER:"manual",SITE_SETTINGS_DRIVER:"database"};
 await build({entryPoints:["src/widget/index.ts"],bundle:true,minify:true,platform:"browser",format:"iife",target:"es2022",outfile:"public/widget.js"});
 const cloudflare=process.argv.includes("--cloudflare");
 const binary=cloudflare?path.resolve("node_modules/@opennextjs/cloudflare/dist/cli/index.js"):path.resolve("node_modules/next/dist/bin/next");
 const buildEnv=cloudflare&&process.platform==="win32"?{...env,NODE_OPTIONS:`${process.env.NODE_OPTIONS??""} --require "${path.resolve("scripts/licensing/windows-symlink.cjs").replaceAll("\\","/")}"`}:env;
 try{const code=await new Promise<number>((resolve,reject)=>{const child=spawn(process.execPath,[binary,"build"],{env:buildEnv,stdio:"inherit",windowsHide:true});child.on("error",reject);child.on("exit",code=>resolve(code??1));});process.exitCode=code;}finally{await runtime.stop();}
}
void main().catch(error=>{process.stderr.write(`Isolated build failed: ${error instanceof Error?error.message:"runtime error"}\n`);process.exitCode=1;});
