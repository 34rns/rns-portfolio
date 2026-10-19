import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getPublishedProjectLinks,
  getPublishedProjectSlugs,
} from "@/lib/db/queries";
import { toProjectView } from "@/lib/projects/view";
import { getTheme } from "@/themes/registry";
import { themeVars } from "@/themes/style";

export const revalidate = 3600;
export const dynamicParams = true;

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.title,
    description: project.tagline,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.tagline,
      url: `/projects/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: RouteParams) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const links = await getPublishedProjectLinks();
  const index = links.findIndex((link) => link.slug === project.slug);
  const candidate = index >= 0 ? links[(index + 1) % links.length] : undefined;
  const next = candidate && candidate.slug !== project.slug ? candidate : null;

  const theme = getTheme(project.theme);
  const ProjectPage = theme.ProjectPage;

  return (
    <div
      style={themeVars(theme, { accent: project.themeOptions?.accent })}
      data-theme={theme.slug}
    >
      <ProjectPage
        project={toProjectView(project)}
        previous={null}
        next={next}
      />
    </div>
  );
}
