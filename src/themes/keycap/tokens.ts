import type { ThemeTokens } from "../types";

/**
 * A letterpress palette: warm paper, black-brown ink, one brick red for
 * interaction and a bottle green for structure. The paper/ink pair is the
 * point; the flag green and gold are used sparingly so the page never reads
 * as a two-colour poster.
 */
export const keycapTokens: ThemeTokens = {
  background: "#F4EFE2",
  surface: "#EAE2CE",
  text: "#191712",
  muted: "#615A4B",
  accent: "#B5341F",
  accentText: "#FFF9EE",
  line: "rgba(25, 23, 18, 0.16)",
  radius: "8px",
  display: "var(--font-archivo), ui-sans-serif, system-ui, sans-serif",
  body: "var(--font-newsreader), Georgia, serif",
  mono: "var(--font-dm-mono), ui-monospace, monospace",
};
