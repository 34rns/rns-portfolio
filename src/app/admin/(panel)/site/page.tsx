import { readSiteState, siteSettingsDriver } from "@/lib/site-settings/store";
import { getAllProjects } from "@/lib/db/queries";
import { dbModelStore } from "@/lib/models/db-store";
import { SiteEditor } from "./site-editor";
export const dynamic = "force-dynamic";
export default async function SitePage() {
  const [state, projects, models] = await Promise.all([readSiteState(), getAllProjects(), dbModelStore.listModels()]);
  return <SiteEditor initial={state} local={siteSettingsDriver() === "local"} projects={projects.filter(p => p.status === "published" && p.placement === "featured").map(p => ({ slug: p.slug, title: p.title }))} models={models.map(m => ({ name: m.name, url: m.url }))} />;
}
