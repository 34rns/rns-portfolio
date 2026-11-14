import { requireCapability } from "@/lib/auth/principal";
import { getLicenseStore } from "@/lib/licensing/transaction-store";
import { PageHeader } from "../../licensing-ui";
import { AppForm } from "../app-form";
export default async function NewAppPage(){const principal=await requireCapability("apps.create");const projects=principal.role==="owner"?await getLicenseStore().read(tx=>tx.query<{id:string;title:string}>("SELECT id,title FROM projects ORDER BY sort_order,title")):[];return <><PageHeader eyebrow="NEW PRODUCT" title="Give your app a Pro side." description="A few clear choices now. Add more plans and features whenever you need them."/><AppForm projects={projects}/></>;}
