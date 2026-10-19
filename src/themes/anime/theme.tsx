import type { ThemeDefinition } from "../types";
import { AnimePreview } from "./preview";
import { AnimeProjectPage } from "./project-page";
import { animeTokens } from "./tokens";

export const animeTheme: ThemeDefinition = {
  slug: "anime",
  name: "Anime 3D",
  blurb: "Manga panels, cel-shaded 3D and vermilion ink.",
  tokens: animeTokens,
  ProjectPage: AnimeProjectPage,
  Preview: AnimePreview,
  motion: {
    reveal: 0.6,
    ease: [0.16, 1, 0.3, 1],
  },
};
