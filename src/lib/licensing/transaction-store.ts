import { Pool } from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
export type SqlExecutor={query<T=Record<string,unknown>>(text:string,params?:unknown[]):Promise<T[]>};
export type AppStore={read<T>(fn:(sql:SqlExecutor)=>Promise<T>):Promise<T>;transaction<T>(fn:(sql:SqlExecutor)=>Promise<T>):Promise<T>};
type Connection={query(text:string,params?:unknown[]):Promise<{rows:Record<string,unknown>[]}>;release():void};
type SqlPool={connect():Promise<Connection>;end():Promise<void>};
export function createLicenseStore(url:string,providedPool?:Pool):AppStore {
  if(!url) throw new Error("A licensing database must be configured.");
  const local=["localhost","127.0.0.1","[::1]"].includes(new URL(url).hostname);
  const run=async<T>(transaction:boolean,fn:(sql:SqlExecutor)=>Promise<T>):Promise<T>=>{
    if(!local && typeof WebSocket!=="undefined") neonConfig.webSocketConstructor=WebSocket;
    const pool=(providedPool ?? (local?new Pool({connectionString:url,max:2}):new NeonPool({connectionString:url,max:2}))) as unknown as SqlPool;
    const connection=await pool.connect();
    const executor:SqlExecutor={query:async<T>(text:string,params:unknown[]=[])=>{const result=await connection.query(text,params);return result.rows as T[];}};
    try{if(transaction){await connection.query("BEGIN");await connection.query("SET LOCAL statement_timeout='15s'");}const value=await fn(executor);if(transaction)await connection.query("COMMIT");return value;}
    catch(error){if(transaction)await connection.query("ROLLBACK");throw error;}
    finally{connection.release();if(!providedPool)await pool.end();}
  };
  return {read:fn=>run(false,fn),transaction:fn=>run(true,fn)};
}
export function getLicenseStore():AppStore{return createLicenseStore(process.env.LICENSE_DATABASE_URL?.trim()||process.env.DATABASE_URL||"");}
