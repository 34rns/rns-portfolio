import type { ProjectRecord } from "@/lib/db/schema";

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
  year: number;
  accent: string | null;
  isPaid: boolean;
  priceCents: number | null;
  currency: string;
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
    year: project.year,
    accent: project.themeOptions?.accent ?? null,
    isPaid: project.isPaid,
    priceCents: project.priceCents,
    currency: project.currency,
  };
}

export function formatPrice(priceCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
  }).format(priceCents / 100);
}
