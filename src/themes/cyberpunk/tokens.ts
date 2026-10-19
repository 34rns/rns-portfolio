import type { ThemeTokens } from "../types";

/**
 * Night City at 03:00. The ground is near-black, not navy; acid yellow is the
 * only interactive colour; cyan is reserved for telemetry and structure. Text
 * pairs clear 4.5:1 against the ground so the HUD language never costs
 * readability.
 */
export const cyberpunkTokens: ThemeTokens = {
  background: "#05070A",
  surface: "#0B1116",
  text: "#E8F4F8",
  muted: "#94AAB5",
  accent: "#E6FF3D",
  accentText: "#05070A",
  line: "rgba(232, 244, 248, 0.14)",
  radius: "0px",
  display: "var(--font-archivo), ui-sans-serif, system-ui, sans-serif",
  body: "var(--font-plex-mono), ui-monospace, SFMono-Regular, monospace",
  mono: "var(--font-plex-mono), ui-monospace, SFMono-Regular, monospace",
};
