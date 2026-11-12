import type { Metadata, Viewport } from "next";
import { brandPalette } from "@/brand/tokens";
import { site } from "@/content/site";
import { getFeaturedProjects } from "@/lib/db/queries";
import { toProjectView } from "@/lib/projects/view";
import { defaultThemeSlug, getTheme } from "@/themes/registry";
import { themeVars } from "@/themes/style";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `${site.name} — ${site.role}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
    images: [{ url: "/opengraph-image", alt: `${site.name} — ${site.role}` }],
  },
};

export const viewport: Viewport = { themeColor: brandPalette.softGrey };

export default async function HomePage() {
  const projects = await getFeaturedProjects();
  const theme = getTheme(defaultThemeSlug);
  const Landing = theme.Landing;

  if (!Landing) {
    throw new Error(`Theme "${theme.slug}" does not provide a landing layout.`);
  }

  return (
    <div style={themeVars(theme)} data-theme={theme.slug}>
      <Landing projects={projects.map(toProjectView)} />
    </div>
  );
}
