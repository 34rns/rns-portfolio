import { spawn } from "node:child_process";
import { randomBytes,generateKeyPairSync } from "node:crypto";
import { readFileSync,writeFileSync,existsSync } from "node:fs";
import path from "node:path";
import { startTestPostgres } from "../../tests/helpers/licensing-postgres";
import { createLicenseStore } from "../../src/lib/licensing/transaction-store";
import { createApp } from "../../src/lib/licensing/apps";
import { issueCodes,redeemCode } from "../../src/lib/licensing/access";
import { hashPassword } from "../../src/lib/auth/password";
import type { Principal } from "../../src/lib/licensing/contracts";
async function main(){
 const runtime=await startTestPostgres("demo"),store=createLicenseStore(runtime.url,runtime.pool),keyFile=path.resolve(".local/licensing-demo-keys.json");
 let secrets:{license:string;signing:string;auth:string};if(existsSync(keyFile))secrets=JSON.parse(readFileSync(keyFile,"utf8"));else{secrets={license:randomBytes(32).toString("hex"),auth:randomBytes(32).toString("hex"),signing:generateKeyPairSync("ed25519").privateKey.export({format:"der",type:"pkcs8"}).toString("base64")};writeFileSync(keyFile,JSON.stringify(secrets));}
 process.env.LICENSE_SECRET=secrets.license;
 const password="Local-demo-password-2026",email="owner@example.test",hash=await hashPassword(password);
 const ownerId="00000000-0000-4000-8000-000000000001",helperId="00000000-0000-4000-8000-000000000002";
 await runtime.pool.query("INSERT INTO admin_members(id,email,name,password_hash,role) VALUES($1,$2,'Demo owner',$3,'owner') ON CONFLICT(email) DO UPDATE SET password_hash=$3,totp_ciphertext=NULL,disabled_at=NULL",[ownerId,email,hash]);
 const principal:Principal={kind:"staff",id:ownerId,role:"owner",appIds:[],environments:["sandbox","live"],capabilities:[]};
 let app=(await runtime.pool.query("SELECT * FROM license_apps WHERE slug='studio-demo'")).rows[0];
 if(!app)app=await createApp(store,principal,{name:"Studio toolkit",slug:"studio-demo",features:[{key:"export_pdf",name:"PDF export"},{key:"batch_render",name:"Batch rendering"}],plans:[{key:"free",name:"Free",priority:0,featureKeys:[]},{key:"pro",name:"Pro",priority:10,featureKeys:["export_pdf","batch_render"]}],allowedOrigins:["http://localhost:3100"]});
 await runtime.pool.query("INSERT INTO admin_members(id,email,name,password_hash,role,app_ids) VALUES($1,'helper@example.test','Demo helper',$2,'helper',$3) ON CONFLICT(email) DO UPDATE SET password_hash=$2,app_ids=$3,disabled_at=NULL",[helperId,hash,JSON.stringify([app.id])]);
 await runtime.pool.query("INSERT INTO admin_members(id,email,name,password_hash,role,app_ids) VALUES('00000000-0000-4000-8000-000000000003','viewer@example.test','Demo viewer',$1,'viewer',$2) ON CONFLICT(email) DO UPDATE SET password_hash=$1,app_ids=$2,disabled_at=NULL",[hash,JSON.stringify([app.id])]);
 if(!(await runtime.pool.query("SELECT id FROM access_licenses WHERE app_id=$1 LIMIT 1",[app.id])).rowCount){const [code]=await issueCodes(store,principal,{appId:app.id,environment:"sandbox"},{type:"timed",durationSeconds:2592000,count:1});await redeemCode(store,{appId:app.id,environment:"sandbox"},{code:code.key,binding:{deviceId:"synthetic-demo-installation"}},"seed-demo-request",new Date());await issueCodes(store,principal,{appId:app.id,environment:"sandbox"},{type:"lifetime",count:12,note:"Synthetic demo codes"});}
 const env={...process.env,DATABASE_URL:runtime.url,LICENSE_DATABASE_URL:runtime.url,LICENSE_SECRET:secrets.license,LICENSE_TOKEN_PRIVATE_KEY:secrets.signing,LICENSE_TOKEN_PRIVATE_KEY_PREVIOUS:"",AUTH_SECRET:secrets.auth,AUTH_URL:"http://localhost:3100",NEXT_PUBLIC_SITE_URL:"http://localhost:3100",KEYGATE_ISSUER:"http://localhost:3100",LICENSE_STAFF_ENABLED:"true",ADMIN_EMAIL:email,ADMIN_PASSWORD_HASH:hash,PAYMENT_PROVIDER:"manual",STORAGE_PROVIDER:"local",SITE_SETTINGS_DRIVER:"database"};
 const next=spawn(process.execPath,[path.resolve("node_modules/next/dist/bin/next"),"dev","--port","3100"],{env,stdio:"inherit",windowsHide:true});
 process.stdout.write(`Synthetic admin: http://localhost:3100/admin\nOwner: ${email}\nHelper: helper@example.test\nLocal-only password: ${password}\n`);
 let stopping=false;const stop=async()=>{if(stopping)return;stopping=true;next.kill();await runtime.stop();};process.on("SIGINT",()=>void stop());process.on("SIGTERM",()=>void stop());next.on("exit",()=>void stop());
}
main().catch(error=>{process.stderr.write(`Local demo could not start: ${error instanceof Error?error.message:"unknown error"}\n`);process.exitCode=1;});
