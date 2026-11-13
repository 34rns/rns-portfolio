import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ProjectView } from "@/lib/projects/view";
import { professionalLandingContent, type LandingContent } from "../landing-content";
import { MagneticLink } from "./magnetic-link";
import { WorkStage } from "./work-stage";

// Read once on the server, keeping the entire hero in the initial static HTML.
const mobileMark = readFileSync(join(process.cwd(), "public/brand/rns-mark-mobile.webp")).toString("base64");

export function Hero({ projects, content = professionalLandingContent }: { projects: ProjectView[]; content?: LandingContent }) {
  const logo = (
    <picture>
      {content.brand.logoSrc === "/brand/rns-mark.webp" && <source media="(max-width:700px)" srcSet={`data:image/webp;base64,${mobileMark}`} />}
      {/* Native picture selection prevents a desktop preload on mobile. */}
      <img src={content.brand.logoSrc} alt={content.brand.logoAlt} width={1400} height={556} loading="eager" fetchPriority="high" decoding="sync" />
    </picture>
  );
  return (
    <section className="rns-hero" aria-labelledby="rns-introduction">
      <div className="rns-hero-intro rns-shell">
      <figure className="rns-logo-stage" data-logo-slot="future-3d">
        {/* Reserved static image mount. A later 3D replacement must preserve its dimensions. */}
        {logo}
      </figure>
      <div className="rns-hero-copy">
        <p className="rns-hero-role">{content.hero.role}</p>
        <h1 id="rns-introduction">{content.hero.headline.map((line, index) => <span key={index}>{line}</span>)}</h1>
        <p className="rns-hero-description">{content.hero.description}</p>
        <div className="rns-hero-actions">
          <MagneticLink href="#work">{content.hero.primaryLabel} <span aria-hidden="true">↗</span></MagneticLink>
          <Link className="rns-text-link" href="#contact">{content.hero.secondaryLabel}</Link>
        </div>
      </div>
      </div>
      <WorkStage content={content.showcase} motion={content.motion} projects={projects.map(({ slug, title, tagline, year, tags, coverImageUrl }) => ({ slug, title, tagline, year, tags, coverImageUrl }))} />
    </section>
  );
}
