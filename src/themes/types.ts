import type { ComponentType, ReactNode } from "react";
import type { ProjectLink, ProjectView } from "@/lib/projects/view";

export type ThemeTokens = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  line: string;
  radius: string;
  display: string;
  body: string;
  mono: string;
};

export type ProjectPageProps = {
  project: ProjectView;
  previous: ProjectLink | null;
  next: ProjectLink | null;
  /** Buyer-only access panel, rendered by the route so the theme only places it. */
  access?: ReactNode;
};

export type ThemeDefinition = {
  slug: string;
  name: string;
  blurb: string;
  tokens: ThemeTokens;
  /** Only the default theme ships the landing layout. */
  Landing?: ComponentType<{ projects: ProjectView[] }>;
  ProjectPage: ComponentType<ProjectPageProps>;
  Preview: ComponentType;
  motion: {
    reveal: number;
    ease: [number, number, number, number];
  };
};
