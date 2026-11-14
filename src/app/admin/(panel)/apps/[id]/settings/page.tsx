import { appContext } from "../../app-context";
import { AppForm } from "../../app-form";
import { can } from "@/lib/auth/permissions";
import { AppTabs,PageHeader } from "../../../licensing-ui";
import { CommandForm } from "../../../command-form";
export default async function SettingsPage({params}:{params:Promise<{id:string}>}){const {id}=await params,{app,principal,scope}=await appContext(id,"sandbox"),editable=can(principal,"apps.write",{...scope,environment:"live"});return <><PageHeader title={app.name} description="Plans, access policy, and redeem-page appearance."/><AppTabs id={id} active="settings"/><AppForm id={id} initial={app.config} editable={editable}/>{editable&&<section className="kg-card" style={{marginTop:24}}><h2>{app.archived_at?"Restore this app":"Archive this app"}</h2><p>Archiving preserves codes and history. Public access is blocked while archived.</p><CommandForm command="app.archive" scope={{...scope,environment:"live"}} data={null} label={app.archived_at?"Restore app":"Archive app"} danger={!app.archived_at}/></section>}</>;}
