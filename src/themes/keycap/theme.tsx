import type { ThemeDefinition } from "../types";
import { KeycapPreview } from "./preview";
import { KeycapProjectPage } from "./project-page";
import { keycapTokens } from "./tokens";

export const keycapTheme: ThemeDefinition = {
  slug: "keycap",
  name: "Keycap",
  blurb:
    "Warm paper, letterpress keycaps and Bangla type for a keyboard case study.",
  tokens: keycapTokens,
  ProjectPage: KeycapProjectPage,
  Preview: KeycapPreview,
  motion: {
    // Tactile, not bouncy: a short settle and one decelerating curve.
    reveal: 0.55,
    ease: [0.16, 1, 0.3, 1],
  },
};
