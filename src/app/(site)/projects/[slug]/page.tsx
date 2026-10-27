import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getPublishedProjectLinks,
  getPublishedProjectSlugs,
} from "@/lib/db/queries";
import { ProjectAccess } from "@/components/project-access";
import { paymentMode } from "@/lib/payments/mode";
import { formatPrice, toProjectView } from "@/lib/projects/view";
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
  // Extra published projects for themes that show a related shelf. Themes that
  // do not use the prop ignore it; the page stays statically generated.
  const related = links
    .filter((link) => link.slug !== project.slug && link.slug !== next?.slug)
    .slice(0, 3);

  const theme = getTheme(project.theme);
  const ProjectPage = theme.ProjectPage;
  const view = toProjectView(project);
  // Buyer-only content never enters the static HTML: the URL is stripped here
  // and the delivery note is never part of the view model.
  const safeView = view.isPaid ? { ...view, liveUrl: null } : view;
  // Sale mode is a server-side decision: the form ships in the static HTML, so
  // this must stay a stable build-time value, not a per-request one.
  const mode = paymentMode();
  const access =
    view.isPaid && view.priceCents
      ? (
          <ProjectAccess
            slug={view.slug}
            priceLabel={formatPrice(view.priceCents, view.currency)}
            isPaid
            downloadUrl={view.downloadUrl}
            mode={mode}
          />
        )
      : null;

  return (
    <div
      style={themeVars(theme, { accent: project.themeOptions?.accent })}
      data-theme={theme.slug}
    >
      <ProjectPage
        project={safeView}
        previous={null}
        next={next}
        related={related}
        access={access}
      />
    </div>
  );
}
