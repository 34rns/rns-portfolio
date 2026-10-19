import type { ThemeDefinition } from "../types";
import { CyberpunkPreview } from "./preview";
import { CyberpunkProjectPage } from "./project-page";
import { cyberpunkTokens } from "./tokens";

export const cyberpunkTheme: ThemeDefinition = {
  slug: "cyberpunk",
  name: "Cyberpunk",
  blurb:
    "Night City dossier: optic feed, acid HUD, glitch title and a trace on the wire.",
  tokens: cyberpunkTokens,
  ProjectPage: CyberpunkProjectPage,
  Preview: CyberpunkPreview,
  motion: {
    // Precise, not bouncy: a short snap and a short entrance. The look comes
    // from the scan and glitch loops, not from easing drama.
    reveal: 0.18,
    ease: [0.2, 0.9, 0.2, 1],
  },
};
