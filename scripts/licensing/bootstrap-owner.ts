import { loadEnvConfig } from "@next/env";
import { createLicenseStore } from "../../src/lib/licensing/transaction-store";
import { assertTestDatabase } from "./check-test-env";
loadEnvConfig(process.cwd());
async function main(){
 const target=process.env.LICENSE_DATABASE_URL?.trim()||process.env.DATABASE_URL||"";
 // Production bootstrap is a release operation, never an accidental default.
 if(!process.argv.includes("--release-authorized"))assertTestDatabase(target,"");
 const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),hash=process.env.ADMIN_PASSWORD_HASH;
 if(!email||!hash)throw new Error("Configure the existing owner email and password hash first.");
 const store=createLicenseStore(target);await store.transaction(async tx=>{await tx.query("INSERT INTO admin_members(email,name,password_hash,role) VALUES($1,'RNS',$2,'owner') ON CONFLICT(email) DO NOTHING",[email,hash]);});
 process.stdout.write("Owner prepared. Enable LICENSE_STAFF_ENABLED=true only after verifying staff login.\n");
}
main().catch(()=>{process.stderr.write("Owner setup failed; verify the explicit target and configuration.\n");process.exitCode=1;});
