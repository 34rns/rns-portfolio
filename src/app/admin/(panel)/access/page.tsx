import { requireCapability } from "@/lib/auth/principal";
import { getLicenseStore } from "@/lib/licensing/transaction-store";
import { accessPage,pageNumber } from "@/lib/licensing/admin-data";
import { PageHeader,Pagination } from "../licensing-ui";
import { AccessTable } from "./access-table";
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}){const filter=await searchParams,principal=await requireCapability("licenses.read"),result=await accessPage(getLicenseStore(),principal,null,{query:filter.q,page:filter.page});return <><PageHeader title="Customer access" description="Inspect active grants, solve device limits, and record support actions."/><form className="kg-filter"><label><span>Find account, license ID, or note</span><input name="q" defaultValue={filter.q}/></label><button className="kg-button kg-button-subtle">Search</button></form><AccessTable rows={result.items}/><Pagination base={`/admin/access?q=${encodeURIComponent(filter.q??"")}`} page={pageNumber(filter.page)} next={result.nextCursor} total={result.total}/></>;}
