import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { assertTestDatabase } from "../../scripts/licensing/check-test-env";

export async function startTestPostgres(kind: "test" | "demo" = "test") {
  const scratch=path.resolve(".local");mkdirSync(scratch,{recursive:true});
  const databaseDir=kind==="demo"?path.join(scratch,"license-demo-postgres"):mkdtempSync(path.join(scratch,"license-test-"));
  const port=kind==="demo"?55433:await new Promise<number>((resolve,reject)=>{const listener=createServer();listener.on("error",reject);listener.listen(0,"127.0.0.1",()=>{const address=listener.address();if(!address||typeof address==="string")return reject(new Error("No test port"));listener.close(()=>resolve(address.port));});});
  const password="isolated-local-test-only";
  const server=new EmbeddedPostgres({databaseDir,user:"postgres",password,port,persistent:true,onLog:()=>{},onError:()=>{},initdbFlags:["--encoding=UTF8","--locale=C"]});
  if(!existsSync(path.join(databaseDir,"PG_VERSION"))) await server.initialise();
  await server.start();
  const bootstrap=server.getPgClient();await bootstrap.connect();
  const dbname=`licensing_${kind}`;
  if(!(await bootstrap.query("SELECT 1 FROM pg_database WHERE datname=$1",[dbname])).rowCount) await bootstrap.query(`CREATE DATABASE ${dbname}`);
  await bootstrap.end();
  const url=`postgres://postgres:${password}@127.0.0.1:${port}/${dbname}`;
  assertTestDatabase(url,process.env.PGHOST??"");
  const pool=new Pool({connectionString:url,max:8});
  await migrate(drizzle(pool),{migrationsFolder:"drizzle"});
  return {url,pool,server,stop:async()=>{await pool.end();await server.stop();if(kind==="test" && path.dirname(databaseDir)===scratch && path.basename(databaseDir).startsWith("license-test-"))await rm(databaseDir,{recursive:true,force:true,maxRetries:3});}};
}
