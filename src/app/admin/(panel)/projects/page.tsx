import { getAllProjects } from "@/lib/db/queries";
import { ProjectLibrary } from "./project-library";
export const dynamic = "force-dynamic";
export default async function ProjectsPage() {
  const projects = await getAllProjects();
  return <ProjectLibrary projects={projects.map(p => ({ id:p.id, slug:p.slug, title:p.title, status:p.status, placement:p.placement, theme:p.theme, isPaid:p.isPaid, cover:p.coverImageUrl }))} />;
}
