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
  work: { label: string; headline: string[] };
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
    description: "Editing tools, a Bengali keyboard, and playful experiments. I build software that makes everyday creative work feel a little better.",
    primaryLabel: "Explore my work", secondaryLabel: "Get in touch",
  },
  showcase: { label: "Inside the work", linkLabel: "Explore project" },
  about: {
    label: "The approach", headline: ["The detail is", "the difference."],
    statement: "Good tools get out of the way. The craft is in making that feel effortless.",
    body: "A faster way to find an asset. A keyboard that feels familiar. A small interaction that saves a few clicks. I build around the moments that make software worth using.",
    linkLabel: "Explore my repositories",
  },
  work: { label: "Tools, products & experiments", headline: ["Selected work."] },
  skills: { headline: ["One idea.", "Every layer."], description: "A connected practice, from the interface to the infrastructure." },
  capabilities: [
    { title: "Engineering", tools: "Next.js / TypeScript / Postgres", body: "The interface, the data, the authentication, and the path to production. One connected system." },
    { title: "Design", tools: "Typography / Layout / Design systems", body: "Clear hierarchy and considered details that hold up on real screens, with real content." },
    { title: "Interaction", tools: "Scroll / Transitions / Micro-interactions", body: "Motion with a reason. Feedback that feels immediate. A quieter path when you need it." },
    { title: "Experiments", tools: "Unity / C# / Shaders", body: "Character rigs, responsive scenes, and playful detours that bring another perspective to the work." },
  ],
  contact: { label: "Have something in mind?", headline: ["Let's make", "a useful thing."], body: "A tool, a product, a better way to do something. Tell me what you're thinking.", linkLabel: "Start a conversation", href: "https://github.com/34rns" },
  motion: { enabled: true, intensity: 1 },
};
