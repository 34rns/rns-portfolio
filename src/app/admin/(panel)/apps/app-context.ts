import { requireCapability } from "@/lib/auth/principal";
import { readApp } from "@/lib/licensing/apps";
import { getLicenseStore } from "@/lib/licensing/transaction-store";
import { parseScope } from "@/lib/licensing/admin-commands";
import { environmentOf } from "../licensing-ui";
export async function appContext(id:string,environment:unknown){const scope=parseScope({appId:id,environment:environmentOf(environment)}),principal=await requireCapability("apps.read",scope),store=getLicenseStore(),app=await store.read(tx=>readApp(tx,id));return {scope,principal,store,app};}
