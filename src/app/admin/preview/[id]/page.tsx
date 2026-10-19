import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth/require-admin";
import { toProjectView } from "@/lib/projects/view";
import { getTheme } from "@/themes/registry";
import { themeVars } from "@/themes/style";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Draft preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const theme = getTheme(project.theme);
  const ProjectPage = theme.ProjectPage;

  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center justify-between bg-[#14171A] px-4 py-2 text-xs text-white">
        <span>
          Draft preview · {project.status} · {theme.name}
        </span>
        <a href={`/admin/projects/${project.id}`} className="underline">
          Back to editor
        </a>
      </div>
      <div
        style={themeVars(theme, { accent: project.themeOptions?.accent })}
        data-theme={theme.slug}
      >
        <ProjectPage project={toProjectView(project)} previous={null} next={null} />
      </div>
    </div>
  );
}
