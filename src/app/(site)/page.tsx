import type { Metadata, Viewport } from "next";
import { brandPalette } from "@/brand/tokens";
import { cache } from "react";
import { readSiteState } from "@/lib/site-settings/store";
import { getFeaturedProjects } from "@/lib/db/queries";
import { toProjectView } from "@/lib/projects/view";
import { defaultThemeSlug, getTheme } from "@/themes/registry";
import { themeVars } from "@/themes/style";

export const revalidate = 3600;

const readSettings = cache(async () => (await readSiteState()).published);
export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSettings();
  return {
    title: { absolute: `${settings.name} — ${settings.role}` },
    description: settings.introduction,
    alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: settings.name, title: `${settings.name} — ${settings.role}`, description: settings.introduction, url: "/", images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title: `${settings.name} — ${settings.role}`, description: settings.introduction, images: ["/opengraph-image"] },
  };
}

export const viewport: Viewport = { themeColor: brandPalette.softGrey };

export default async function HomePage() {
  const [projects, settings] = await Promise.all([getFeaturedProjects(), readSettings()]);
  const theme = getTheme(defaultThemeSlug);
  const Landing = theme.Landing;

  if (!Landing) {
    throw new Error(`Theme "${theme.slug}" does not provide a landing layout.`);
  }

  return (
    <div style={themeVars(theme)} data-theme={theme.slug}>
      <Landing projects={projects.map(toProjectView)} settings={settings} />
    </div>
  );
}
