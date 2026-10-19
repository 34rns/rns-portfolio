import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/db/queries";
import { getStorage } from "@/lib/uploads/storage";
import { themeList } from "@/themes/registry";
import {
  ProjectForm,
  type ProjectFormValues,
  type ThemeChoice,
} from "../../project-form";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) notFound();

  const themes: ThemeChoice[] = themeList.map((theme) => ({
    slug: theme.slug,
    name: theme.name,
    blurb: theme.blurb,
    accent: theme.tokens.accent,
    background: theme.tokens.background,
    text: theme.tokens.text,
  }));

  const values: ProjectFormValues = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    tagline: project.tagline,
    description: project.description,
    coverImageUrl: project.coverImageUrl ?? "",
    gallery: project.gallery.join("\n"),
    tags: project.tags.join(", "),
    liveUrl: project.liveUrl ?? "",
    repoUrl: project.repoUrl ?? "",
    year: project.year,
    status: project.status,
    placement: project.placement,
    theme: project.theme,
    themeAccent: project.themeOptions?.accent ?? "",
    isPaid: project.isPaid,
    price: project.priceCents != null ? (project.priceCents / 100).toString() : "",
    currency: project.currency,
    providerProductId: project.providerProductId ?? "",
    modelUrl: project.modelUrl ?? "",
    lighting: project.lighting,
    modelScale: project.modelScale,
    modelOffsetX: project.modelOffsetX,
    modelOffsetY: project.modelOffsetY,
    modelOffsetZ: project.modelOffsetZ,
    deliveryNote: project.deliveryNote ?? "",
    sortOrder: project.sortOrder,
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-medium tracking-tight">{project.title}</h1>
        <a
          href={`/admin/preview/${project.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline"
        >
          Open live preview
        </a>
      </div>
      <p className="mt-1 text-sm text-[#6B6B64]">
        /{project.slug} · {project.status}
      </p>
      <ProjectForm
        project={values}
        themes={themes}
        directUploads={getStorage().direct}
      />
    </div>
  );
}
