import { requireAdmin } from "@/lib/auth/require-admin";
import { readSiteState } from "@/lib/site-settings/store";
import { getFeaturedProjects } from "@/lib/db/queries";
import { toProjectView } from "@/lib/projects/view";
import { ProfessionalLanding } from "@/themes/professional/landing";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function SitePreview() {
  await requireAdmin();
  const [state, projects] = await Promise.all([readSiteState(), getFeaturedProjects()]);
  return <><div style={{ background: "#FFC900", color: "#101214", padding: "12px 20px", font: "12px var(--font-archivo),sans-serif", display: "flex", justifyContent: "space-between", gap: 20 }}><span>Saved draft preview · This is private.</span><Link href="/admin/site">Back to editor ↗</Link></div><ProfessionalLanding settings={state.draft} projects={projects.map(toProjectView)} /></>;
}
