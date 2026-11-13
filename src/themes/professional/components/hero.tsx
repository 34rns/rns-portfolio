import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ProjectView } from "@/lib/projects/view";
import { MagneticLink } from "./magnetic-link";
import { WorkStage } from "./work-stage";

// Read once on the server, keeping the entire hero in the initial static HTML.
const mobileMark = readFileSync(join(process.cwd(), "public/brand/rns-mark-mobile.webp")).toString("base64");

export function Hero({ projects }: { projects: ProjectView[] }) {
  const logo = (
    <picture>
      <source media="(max-width:700px)" srcSet={`data:image/webp;base64,${mobileMark}`} />
      {/* Native picture selection prevents a desktop preload on mobile. */}
      <img src="/brand/rns-mark.webp" alt="RNS logo in white and electric yellow" width={1400} height={556} loading="eager" fetchPriority="high" decoding="sync" />
    </picture>
  );
  return (
    <section className="rns-hero rns-shell" aria-labelledby="rns-introduction">
      <div className="rns-hero-copy">
        <p className="rns-hero-role">Full-stack engineer &amp; interface designer</p>
        <h1 id="rns-introduction">Creative tools.<br />Serious craft.</h1>
        <p className="rns-hero-description">
          I&apos;m RNS. I build software for the people making things:
          editing tools, storefronts, keyboards, and the occasional game.
        </p>
        <div className="rns-hero-actions">
          <MagneticLink href="#work">Explore the work <span aria-hidden="true">↗</span></MagneticLink>
          <Link className="rns-text-link" href="#contact">Get in touch</Link>
        </div>
      </div>
      <WorkStage logo={logo} projects={projects.map(({ slug, title, coverImageUrl }) => ({ slug, title, coverImageUrl }))} />
    </section>
  );
}
