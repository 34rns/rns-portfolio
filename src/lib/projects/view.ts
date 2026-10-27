import type { ProjectRecord } from "@/lib/db/schema";
import { getLightingPreset, type ProjectModel } from "./model";

export type ProjectLink = {
  slug: string;
  title: string;
  year: number;
};

export type ProjectView = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverImageUrl: string | null;
  gallery: string[];
  tags: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  /** Free public download; shown even on a paid project. */
  downloadUrl: string | null;
  year: number;
  accent: string | null;
  isPaid: boolean;
  priceCents: number | null;
  currency: string;
  model: ProjectModel;
};

export function toProjectView(project: ProjectRecord): ProjectView {
  return {
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    description: project.description,
    coverImageUrl: project.coverImageUrl,
    gallery: project.gallery ?? [],
    tags: project.tags ?? [],
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
    downloadUrl: project.downloadUrl,
    year: project.year,
    accent: project.themeOptions?.accent ?? null,
    isPaid: project.isPaid,
    priceCents: project.priceCents,
    currency: project.currency,
    model: {
      url: project.modelUrl,
      lighting: getLightingPreset(project.lighting).id,
      scale: project.modelScale,
      offset: [project.modelOffsetX, project.modelOffsetY, project.modelOffsetZ],
    },
  };
}

export function formatPrice(priceCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
  }).format(priceCents / 100);
}
