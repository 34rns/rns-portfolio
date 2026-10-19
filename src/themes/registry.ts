import type { ThemeDefinition } from "./types";
import { professionalTheme } from "./professional/theme";

export const themes = {
  professional: professionalTheme,
} satisfies Record<string, ThemeDefinition>;

export type ThemeSlug = keyof typeof themes;

export const defaultThemeSlug: ThemeSlug = "professional";

export function getTheme(slug: string): ThemeDefinition {
  return (themes as Record<string, ThemeDefinition>)[slug] ?? themes[defaultThemeSlug];
}

export const themeList: ThemeDefinition[] = Object.values(themes);
