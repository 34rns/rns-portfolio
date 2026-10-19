import { getFeaturedProjects } from "@/lib/db/queries";
import { toProjectView } from "@/lib/projects/view";
import { defaultThemeSlug, getTheme } from "@/themes/registry";
import { themeVars } from "@/themes/style";

export const revalidate = 3600;

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
