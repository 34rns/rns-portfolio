import type { ThemeDefinition } from "../types";
import { ProfessionalLanding } from "./landing";
import { ProfessionalPreview } from "./preview";
import { ProfessionalProjectPage } from "./project-page";
import { professionalTokens } from "./tokens";

export const professionalTheme: ThemeDefinition = {
  slug: "professional",
  name: "Professional",
  blurb: "Editorial grid, expanded grotesque type, restrained motion.",
  tokens: professionalTokens,
  Landing: ProfessionalLanding,
  ProjectPage: ProfessionalProjectPage,
  Preview: ProfessionalPreview,
  motion: {
    reveal: 0.72,
    ease: [0.16, 1, 0.3, 1],
  },
};
