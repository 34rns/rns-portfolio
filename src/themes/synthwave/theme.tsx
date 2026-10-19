import type { ThemeDefinition } from "../types";
import { SynthwavePreview } from "./preview";
import { SynthwaveProjectPage } from "./project-page";
import { synthwaveTokens } from "./tokens";

export const synthwaveTheme: ThemeDefinition = {
  slug: "synthwave",
  name: "Synthwave",
  blurb: "Neon grid, striped sun, CRT scanlines and an arcade boot.",
  tokens: synthwaveTokens,
  ProjectPage: SynthwaveProjectPage,
  Preview: SynthwavePreview,
  motion: {
    // Energetic: short taps, a half-second entrance, one decelerating curve.
    reveal: 0.22,
    ease: [0.16, 1, 0.3, 1],
  },
};
