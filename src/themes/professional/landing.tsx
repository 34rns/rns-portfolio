import { brandCss } from "@/brand/tokens";
import Link from "next/link";
import { site } from "@/content/site";
import type { ProjectView } from "@/lib/projects/view";
import { Hero } from "./components/hero";
import { LandingMotion } from "./components/landing-motion";
import { StudioCursor } from "./components/studio-cursor";
import { ArrowIcon } from "./components/icons";
import { MagneticLink } from "./components/magnetic-link";
import { WorkIndex } from "./components/work-index";
import { professionalLandingStyles } from "./landing-styles";
import { professionalLandingContent, type LandingContent } from "./landing-content";

function SiteHeader({ note }: { note: string }) {
  return (
    <header className="rns-header rns-shell">
      <span className="rns-header-note">{note}</span>
      <nav aria-label="Primary">
        <Link href="#work">Work</Link><Link href="#about">About</Link><Link href="#contact">Contact</Link>
        <a href={site.github} target="_blank" rel="noreferrer">GitHub <ArrowIcon /></a>
      </nav>
    </header>
  );
}

export function ProfessionalLanding({ projects, content = professionalLandingContent }: { projects: ProjectView[]; content?: LandingContent }) {
  return (
    <div id="top" className="rns-landing" data-brand-tone="light" data-motion-enabled={content.motion.enabled}>
      <style>{brandCss + professionalLandingStyles}</style>
      <LandingMotion />
      <StudioCursor enabled={content.motion.enabled} />
      <div className="rns-opening" data-brand-tone="dark"><SiteHeader note={content.headerNote} /></div>
      <main id="main" tabIndex={-1}>
        <div className="rns-opening" data-brand-tone="dark">
          <Hero content={content} />
        </div>
        <WorkIndex projects={projects} content={content.work} />
        <section id="about" className="rns-about" aria-labelledby="rns-about-title">
          <div className="rns-about-inner rns-shell">
          <div className="rns-about-heading"><h2 id="rns-about-title">{content.about.headline.map((line,index) => <span key={index}>{line}</span>)}</h2></div>
          <div className="rns-about-copy">
            <p>{content.about.statement}</p>
            <p>{content.about.body}</p>
            <a className="rns-text-link" href={site.github} target="_blank" rel="noreferrer">{content.about.linkLabel} <ArrowIcon /></a>
          </div>
          </div>
          <ul className="rns-capabilities rns-shell" aria-label="Design and engineering practice">{content.capabilities.map(item => <li key={item.title}><h3>{item.title}</h3><div><p>{item.body}</p><span>{item.tools}</span></div></li>)}</ul>
        </section>
        <section id="contact" className="rns-contact" data-brand-tone="dark" aria-labelledby="rns-contact-title">
          <div className="rns-shell rns-contact-inner"><div><h2 id="rns-contact-title">{content.contact.headline.map((line,index) => <span key={index}>{line}</span>)}</h2></div><div className="rns-contact-copy"><p>{content.contact.body}</p><MagneticLink href={content.contact.href} external>{content.contact.linkLabel} <ArrowIcon /></MagneticLink></div></div>
        </section>
      </main>
      <footer className="rns-footer rns-shell"><span>© {new Date().getFullYear()} RNS</span><span>Engineering &amp; interface design</span><Link href="#top">Back to top <ArrowIcon up /></Link></footer>
    </div>
  );
}
