import type { ThemeDefinition } from "../types";
import { FolderDockPreview } from "./preview";
import { FolderDockProjectPage } from "./project-page";
import { folderdockTokens } from "./tokens";

export const folderdockTheme: ThemeDefinition = {
  slug: "folderdock",
  name: "FolderDock",
  blurb: "Charcoal editor panels, precise orange controls and local-first detail.",
  tokens: folderdockTokens,
  ProjectPage: FolderDockProjectPage,
  Preview: FolderDockPreview,
  motion: {
    reveal: 0.4,
    ease: [0.16, 1, 0.3, 1],
  },
};
