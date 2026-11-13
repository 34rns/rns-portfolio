import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { ProjectView } from "@/lib/projects/view";
import { MagneticLink } from "./magnetic-link";

export function Hero({ latest }: { latest?: ProjectView }) {
  return (
    <section className="rns-hero rns-shell" aria-labelledby="rns-introduction">
      <div className="rns-hero-copy">
        <p className="rns-hero-role">Full-stack development &amp; interface design</p>
        <h1 id="rns-introduction">Engineering,<br />with an eye<br />for design.</h1>
        <p className="rns-hero-description">
          I&apos;m RNS. I build storefronts, practical tools, and playful
          experiments. I care about the first interaction and the database behind it.
        </p>
        <div className="rns-hero-actions">
          <MagneticLink href="#work">Explore the work <span aria-hidden="true">↗</span></MagneticLink>
          <Link className="rns-text-link" href="#contact">Get in touch</Link>
        </div>
        {latest ? (
          <div className="rns-latest">
            <span>In the portfolio</span>
            <Link href={`/projects/${latest.slug}`} prefetch={false}>{latest.title}<span aria-hidden="true"> ↗</span></Link>
          </div>
        ) : null}
      </div>
      <figure className="rns-logo-stage" data-brand-tone="dark" data-logo-slot="future-3d">
        {/* Future 3D logo mounts inside this stage; keep its responsive aspect ratio. */}
        <div className="rns-logo-mount">
          <Image src="/brand/rns-mark.webp" alt="RNS brand logo in white and electric yellow" width={1400} height={556} unoptimized loading="eager" fetchPriority="high" />
        </div>
        <figcaption><span>Product engineering</span><span>Interface design</span></figcaption>
        <span className="rns-logo-pixels" aria-hidden="true"><i /><i /><i /></span>
      </figure>
      <p className="sr-only">{site.role}.</p>
    </section>
  );
}
