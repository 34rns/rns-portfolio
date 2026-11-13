import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ProjectView } from "@/lib/projects/view";
import { professionalLandingContent, type LandingContent } from "../landing-content";
import { MagneticLink } from "./magnetic-link";
import { WorkStage } from "./work-stage";
import { LogoStage } from "./brand-logo/logo-stage";
import { logoHeroStyles } from "./brand-logo/hero-styles";

// Read once on the server, keeping the entire hero in the initial static HTML.
const mobileMark = readFileSync(join(process.cwd(), "public/brand/rns-mark-mobile.webp")).toString("base64");

export function Hero({ projects, content = professionalLandingContent }: { projects: ProjectView[]; content?: LandingContent }) {
  const copy = content === professionalLandingContent ? {
    ...content.hero,
    role: "Hey, I’m RNS.",
    headline: ["I make tools", "for people", "who make things."],
    description: "Editing tools, a Bengali keyboard, browser experiments. I make software for the moments when the right tool doesn’t exist yet.",
    primaryLabel: "See what I’m making",
  } : content.hero;
  const logo = (
    <picture>
      {content.brand.logoSrc === "/brand/rns-mark.webp" && <source media="(max-width:700px)" srcSet={`data:image/webp;base64,${mobileMark}`} />}
      {/* Native picture selection prevents a desktop preload on mobile. */}
      <img src={content.brand.logoSrc} alt={content.brand.logoAlt} width={1400} height={556} loading="eager" fetchPriority="high" decoding="sync" />
    </picture>
  );
  return (
    <section className="rns-hero" aria-labelledby="rns-introduction">
      <style>{logoHeroStyles}</style>
      <div className="rns-hero-intro rns-shell">
      <figure className="rns-logo-stage" data-logo-slot="future-3d">
        <LogoStage enabled={content.motion.enabled && content.brand.logoSrc === "/brand/rns-mark.webp"}>{logo}</LogoStage>
      </figure>
      <div className="rns-hero-copy">
        <p className="rns-hero-role">{copy.role}</p>
        <h1 id="rns-introduction">{copy.headline.map((line, index) => <span key={index}>{line}</span>)}</h1>
        <p className="rns-hero-description">{copy.description}</p>
        <div className="rns-hero-actions">
          <MagneticLink href="#work">{copy.primaryLabel} <span aria-hidden="true">↗</span></MagneticLink>
          <Link className="rns-text-link" href="#contact">{copy.secondaryLabel}</Link>
        </div>
      </div>
      </div>
      <WorkStage content={content.showcase} motion={content.motion} projects={projects.map(({ slug, title, tagline, year, tags, coverImageUrl }) => ({ slug, title, tagline, year, tags, coverImageUrl }))} />
    </section>
  );
}
