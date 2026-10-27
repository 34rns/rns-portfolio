import { dbModelStore } from "@/lib/models/db-store";
import { directUploadsEnabled } from "@/lib/uploads/storage";
import { themeList } from "@/themes/registry";
import { ProjectForm, type ThemeChoice } from "../../project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const models = (await dbModelStore.listModels()).map((model) => ({
    name: model.name,
    url: model.url,
  }));

  const themes: ThemeChoice[] = themeList.map((theme) => ({
    slug: theme.slug,
    name: theme.name,
    blurb: theme.blurb,
    accent: theme.tokens.accent,
    background: theme.tokens.background,
    text: theme.tokens.text,
  }));

  return (
    <div>
      <h1 className="text-2xl font-medium tracking-tight">New project</h1>
      <p className="mt-1 text-sm text-[#6B6B64]">
        Drafts stay private until you publish. Preview works before publishing.
      </p>
      <ProjectForm themes={themes} directUploads={directUploadsEnabled()} models={models} />
    </div>
  );
}
