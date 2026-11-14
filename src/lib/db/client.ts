import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as localDrizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { NeonHttpQueryResultHKT } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Run `vercel env pull .env.local` (or add it to .env.local).",
  );
}

const isLocal=["localhost","127.0.0.1","[::1]"].includes(new URL(url).hostname);
const localGlobal=globalThis as typeof globalThis & {rnsLocalPool?:Pool};
const pool=isLocal?(localGlobal.rnsLocalPool??=new Pool({connectionString:url,max:8})):null;
export const db:PgDatabase<NodePgQueryResultHKT|NeonHttpQueryResultHKT,typeof schema> = pool ? localDrizzle(pool,{schema}) : drizzle(neon(url), { schema });
