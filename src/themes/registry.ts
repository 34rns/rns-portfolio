import type { ThemeDefinition } from "./types";
import { animeTheme } from "./anime/theme";
import { cyberpunkTheme } from "./cyberpunk/theme";
import { folderdockTheme } from "./folderdock/theme";
import { keycapTheme } from "./keycap/theme";
import { professionalTheme } from "./professional/theme";
import { synthwaveTheme } from "./synthwave/theme";

export const themes = {
  professional: professionalTheme,
  anime: animeTheme,
  synthwave: synthwaveTheme,
  cyberpunk: cyberpunkTheme,
  keycap: keycapTheme,
  folderdock: folderdockTheme,
} satisfies Record<string, ThemeDefinition>;

export type ThemeSlug = keyof typeof themes;

export const defaultThemeSlug: ThemeSlug = "professional";

export function getTheme(slug: string): ThemeDefinition {
  return (themes as Record<string, ThemeDefinition>)[slug] ?? themes[defaultThemeSlug];
}

export const themeList: ThemeDefinition[] = Object.values(themes);
