import type { ProjectView } from "@/lib/projects/view";
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings/config";
import { InteractiveStudio } from "./components/interactive-studio";

export function ProfessionalLanding({ projects, settings = defaultSiteSettings }: { projects: ProjectView[]; settings?: SiteSettings; content?: import("./landing-content").LandingContent }) {
  return <InteractiveStudio projects={projects} settings={settings} />;
}
