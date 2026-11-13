import { z } from "zod";

const shortText = z.string().trim().min(1).max(100);
const copy = z.string().trim().min(1).max(1200);
const webUrl = z.string().max(2048).refine(value => {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "Use an http(s) URL or a local file path.");

export const siteSettingsSchema = z.object({
  name: shortText,
  role: shortText,
  heroLineOne: z.string().trim().min(1).max(18).default("Ideas into"),
  heroLineTwo: z.string().trim().min(1).max(18).default("real things."),
  introduction: z.string().trim().min(1).max(240),
  aboutTitle: shortText,
  aboutBody: copy,
  contactTitle: shortText,
  contactBody: z.string().trim().min(1).max(300),
  contactLabel: shortText,
  contactUrl: z.string().max(2048).refine(value => {
    try { return ["https:", "http:", "mailto:"].includes(new URL(value).protocol); } catch { return false; }
  }, "Use an https URL or mailto address."),
  githubUrl: z.string().url().max(2048).refine(value => ["http:", "https:"].includes(new URL(value).protocol), "Use an https URL."),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color."),
  appearance: z.enum(["night", "paper"]),
  logoUrl: webUrl,
  modelUrl: webUrl,
  material: z.enum(["chrome", "ceramic"]),
  motion: z.boolean(),
  motionIntensity: z.number().min(0).max(1.5),
  showAbout: z.boolean(),
  showContact: z.boolean(),
  projectLayout: z.enum(["gallery", "compact"]),
  featuredSlug: z.string().max(100),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const defaultSiteSettings: SiteSettings = {
  name: "RNS",
  role: "Independent engineer & interface designer",
  heroLineOne: "Ideas into",
  heroLineTwo: "real things.",
  introduction: "I make software for people who create. Editing tools, a Bengali keyboard, and experiments that start with a little curiosity.",
  aboutTitle: "A little curiosity. A lot of making.",
  aboutBody: "I’m a full-stack engineer and interface designer. My work moves between Adobe editing panels, Android input, browser extensions and Unity. I care about the moment an idea becomes something you can actually use.",
  contactTitle: "Let’s make something useful.",
  contactBody: "Explore my code, releases and ongoing experiments on GitHub.",
  contactLabel: "Find me on GitHub",
  contactUrl: "https://github.com/34rns",
  githubUrl: "https://github.com/34rns",
  accent: "#FFC900",
  appearance: "night",
  logoUrl: "/brand/rns-mark-alpha.webp",
  modelUrl: "",
  material: "chrome",
  motion: true,
  motionIntensity: 1,
  showAbout: true,
  showContact: true,
  projectLayout: "gallery",
  featuredSlug: "",
};

export function onAccent(hex: string) {
  const channels = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4));
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  return (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? "#000000" : "#FFFFFF";
}

function luminance(hex: string) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
export function contrastRatio(a: string, b: string) {
  const first = luminance(a), second = luminance(b);
  return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
}
/** Keep accent text legible on both surfaces, even when the chosen color is very pale or dark. */
export function accentInk(hex: string, appearance: "night" | "paper") {
  const background = appearance === "paper" ? "#eeefe8" : "#101214";
  const target = appearance === "paper" ? 0 : 255;
  let result = hex;
  for (let step = 0; step <= 20; step++) {
    const amount = step / 20;
    result = "#" + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - amount) + target * amount).toString(16).padStart(2, "0")).join("");
    if (contrastRatio(result, background) >= 4.5) break;
  }
  return result;
}
