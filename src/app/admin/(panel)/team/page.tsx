import { requireCapability } from "@/lib/auth/principal";
import { getLicenseStore } from "@/lib/licensing/transaction-store";
import { listApps } from "@/lib/licensing/apps";
import { issuer } from "@/lib/licensing/v1-token";
import type { StaffRole } from "@/lib/licensing/contracts";
import { PageHeader } from "../licensing-ui";
import { InviteForm,MemberForm } from "./team-forms";
export default async function Page(){const principal=await requireCapability("team.write"),store=getLicenseStore();const [apps,members]=await Promise.all([listApps(store,principal),store.read(tx=>tx.query<{id:string;name:string;email:string;role:StaffRole;app_ids:string[];capabilities:string[];disabled_at:Date|null}>("SELECT id,name,email,role,app_ids,capabilities,disabled_at FROM admin_members ORDER BY created_at"))]);return <><PageHeader title="A team with clear boundaries." description="Give each helper their own account and only the product access they need."/><div className="kg-stack"><div className="kg-callout">Helper: assigned-app read, Sandbox codes, and support notes. Viewer: read only. Admin: assigned products. Owner: portfolio, team, secrets, and release. Sensitive changes need a sign-in within five minutes.</div><InviteForm apps={apps.map(a=>({id:a.id,name:a.name}))} origin={issuer()}/><section className="kg-card"><h2>Members & permissions</h2>{members.map(member=><MemberForm key={member.id} member={{...member,disabled_at:member.disabled_at?.toISOString()??null}} apps={apps.map(a=>({id:a.id,name:a.name}))}/>)}</section></div></>;}
