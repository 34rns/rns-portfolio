import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { professionalLandingContent, type LandingContent } from "../landing-content";
import { MagneticLink } from "./magnetic-link";
import { ArrowIcon } from "./icons";
import { LogoStage } from "./brand-logo/logo-stage";
import { logoHeroStyles } from "./brand-logo/hero-styles";

// Read once on the server, keeping the entire hero in the initial static HTML.
const mobileMark = readFileSync(join(process.cwd(), "public/brand/rns-mark-mobile-alpha.webp")).toString("base64");

export function Hero({ content = professionalLandingContent }: { content?: LandingContent }) {
  const copy = content.hero;
  const logo = (
    <picture>
      {content.brand.logoSrc === professionalLandingContent.brand.logoSrc && <source media="(max-width:700px)" srcSet={`data:image/webp;base64,${mobileMark}`} />}
      {/* Native picture selection prevents a desktop preload on mobile. */}
      <img src={content.brand.logoSrc} alt={content.brand.logoAlt} width={1400} height={556} loading="eager" fetchPriority="high" decoding="sync" />
    </picture>
  );
  return (
    <section className="rns-hero" aria-labelledby="rns-introduction">
      <style>{logoHeroStyles}</style>
      <div className="rns-hero-intro rns-shell">
      <div className="rns-hero-copy">
        <h1 id="rns-introduction">{copy.headline.map((line, index) => <span key={index}>{line}</span>)}</h1>
        <p className="rns-hero-description"><span className="rns-hero-role">{copy.role}</span> {copy.description}</p>
        <div className="rns-hero-actions">
          <MagneticLink href="#work">{copy.primaryLabel} <ArrowIcon /></MagneticLink>
          <Link className="rns-text-link" href="#contact">{copy.secondaryLabel}</Link>
        </div>
      </div>
      <figure className="rns-logo-stage" data-logo-slot="future-3d">
        <LogoStage enabled={content.motion.enabled && content.brand.logoSrc === professionalLandingContent.brand.logoSrc}>{logo}</LogoStage>
      </figure>
      </div>
    </section>
  );
}
