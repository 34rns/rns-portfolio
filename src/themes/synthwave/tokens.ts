import type { ThemeTokens } from "../types";

/**
 * A 1986 broadcast palette. Magenta is the only interactive colour; cyan is
 * structure; orange is reserved for the sunset so the page never turns into a
 * rainbow. Text pairs clear 4.5:1 against the deep purple ground.
 */
export const synthwaveTokens: ThemeTokens = {
  background: "#1A0B2E",
  surface: "#241041",
  text: "#F4E9FF",
  muted: "#B9A3D6",
  accent: "#FF2E88",
  accentText: "#1A0B2E",
  line: "rgba(244, 233, 255, 0.16)",
  radius: "2px",
  display: "var(--font-vt323), ui-monospace, SFMono-Regular, monospace",
  body: "var(--font-plex-mono), ui-monospace, SFMono-Regular, monospace",
  mono: "var(--font-plex-mono), ui-monospace, SFMono-Regular, monospace",
};
