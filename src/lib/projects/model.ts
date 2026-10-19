/**
 * Lighting rigs shared by the admin picker and the 3D viewer. Plain data so
 * server components can import it without pulling three.js into the bundle.
 */
export const LIGHTING_PRESETS = [
  {
    id: "studio",
    label: "Studio",
    blurb: "Neutral key, cool fill, soft rim.",
    key: "#fff5e6",
    fill: "#9cb4ff",
    rim: "#ffb8a3",
    ambient: "#7d8494",
    intensity: 1,
  },
  {
    id: "dusk",
    label: "Dusk",
    blurb: "Low amber key with a violet edge.",
    key: "#ffb066",
    fill: "#5d63c9",
    rim: "#ff6f91",
    ambient: "#4a4560",
    intensity: 1.15,
  },
  {
    id: "neon",
    label: "Neon",
    blurb: "Magenta and cyan, hard shadows.",
    key: "#ff5fd2",
    fill: "#41e9ff",
    rim: "#c8ff5f",
    ambient: "#2a2740",
    intensity: 1.3,
  },
  {
    id: "paper",
    label: "Paper",
    blurb: "Flat daylight for cel shading.",
    key: "#fffdf4",
    fill: "#cfd8ff",
    rim: "#ff9f80",
    ambient: "#e8e2d2",
    intensity: 0.9,
  },
] as const;

export type LightingPreset = (typeof LIGHTING_PRESETS)[number]["id"];

export const defaultLighting: LightingPreset = "studio";
export const LIGHTING_IDS = LIGHTING_PRESETS.map((preset) => preset.id) as LightingPreset[];

export function getLightingPreset(id: string | null | undefined) {
  return LIGHTING_PRESETS.find((preset) => preset.id === id) ?? LIGHTING_PRESETS[0];
}

export const MODEL_LIMITS = {
  scale: { min: 0.2, max: 8 },
  offset: { min: -4, max: 4 },
} as const;

export type ProjectModel = {
  url: string | null;
  lighting: LightingPreset;
  scale: number;
  offset: [number, number, number];
};
