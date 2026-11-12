/** Source colors from brand/Color_Swatches.png; neutrals below are derived roles. */
export const brandPalette = {
  charcoal: "#17191C",
  yellow: "#FFC900",
  white: "#FFFFFF",
  softGrey: "#F3F4F5",
} as const;

export const brandRoles = {
  light: {
    background: brandPalette.softGrey,
    surface: brandPalette.white,
    text: brandPalette.charcoal,
    muted: "#595B5D",
    accent: brandPalette.yellow,
    "accent-2": brandPalette.charcoal,
    border: "#8B8C8D",
    "on-accent": brandPalette.charcoal,
  },
  dark: {
    background: brandPalette.charcoal,
    surface: "#25272A",
    text: brandPalette.white,
    muted: "#B5B6B7",
    accent: brandPalette.yellow,
    "accent-2": brandPalette.softGrey,
    border: "#707174",
    "on-accent": brandPalette.charcoal,
  },
} as const;

export const brandCss = Object.entries(brandRoles)
  .map(([tone, roles]) => `[data-brand-tone="${tone}"]{${Object.entries(roles)
    .map(([role, color]) => `--brand-${role}:${color};`).join("")}}`)
  .join("\n");
