import type { CSSProperties } from "react";
import type { ThemeDefinition } from "./types";

export function themeVars(
  theme: ThemeDefinition,
  options?: { accent?: string | null },
): CSSProperties {
  const accent = options?.accent || theme.tokens.accent;

  return {
    "--theme-bg": theme.tokens.background,
    "--theme-surface": theme.tokens.surface,
    "--theme-text": theme.tokens.text,
    "--theme-muted": theme.tokens.muted,
    "--theme-accent": accent,
    "--theme-accent-text": theme.tokens.accentText,
    "--theme-line": theme.tokens.line,
    "--theme-radius": theme.tokens.radius,
    backgroundColor: "var(--theme-bg)",
    color: "var(--theme-text)",
    fontFamily: theme.tokens.body,
  } as CSSProperties;
}
