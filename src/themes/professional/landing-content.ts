/**
 * Serializable content seam for the selected landing's future admin editor.
 * These are local defaults, not saved admin settings. Projects still come from the database.
 */
export type LandingContent = {
  brand: { logoSrc: string; logoAlt: string };
  headerNote: string;
  hero: { role: string; headline: string[]; description: string; primaryLabel: string; secondaryLabel: string };
  showcase: { label: string; linkLabel: string };
  about: { label: string; headline: string[]; statement: string; body: string; linkLabel: string };
  work: { label: string; headline: string[]; textOnlySlugs?: string[] };
  skills: { headline: string[]; description: string };
  capabilities: { title: string; tools: string; body: string }[];
  contact: { label: string; headline: string[]; body: string; linkLabel: string; href: string };
  motion: { enabled: boolean; intensity: number };
};

export const professionalLandingContent: LandingContent = {
  brand: { logoSrc: "/brand/rns-mark-alpha.webp", logoAlt: "RNS logo in white and electric yellow" },
  headerNote: "Independent development & interface design",
  hero: {
    role: "Hey, I’m RNS.",
    headline: ["Tools for people", "who make things."],
    description: "I build editing tools, a Bengali keyboard, and small software experiments.",
    primaryLabel: "Explore my work", secondaryLabel: "More on GitHub",
  },
  showcase: { label: "Inside the work", linkLabel: "Explore project" },
  about: {
    label: "The approach", headline: ["Design &", "engineering."],
    statement: "I’m a full-stack engineer and interface designer.",
    body: "My work spans Adobe editing panels, Android input, browser extensions and Unity experiments. I move between the interface, the code and the interactions that connect them.",
    linkLabel: "Explore my repositories",
  },
  work: { label: "Tools, products & experiments", headline: ["Selected projects."], textOnlySlugs: ["loupe"] },
  skills: { headline: ["One idea.", "Every layer."], description: "A connected practice, from the interface to the infrastructure." },
  capabilities: [
    { title: "Engineering", tools: "Next.js / TypeScript / Postgres", body: "Web interfaces, data, authentication and delivery." },
    { title: "Design", tools: "Typography / Layout / Design systems", body: "Typography and layouts for real product interfaces." },
    { title: "Interaction", tools: "Pointer / Keyboard / Reduced motion", body: "Clear feedback, keyboard navigation and quieter motion paths." },
    { title: "Experiments", tools: "Unity / C# / Shaders", body: "Character rigs, shaders and interactive 3D scenes." },
  ],
  contact: { label: "Have something in mind?", headline: ["There’s more", "on GitHub."], body: "Explore the code, project repositories and latest releases.", linkLabel: "Find me on GitHub", href: "https://github.com/34rns" },
  motion: { enabled: true, intensity: 1 },
};
