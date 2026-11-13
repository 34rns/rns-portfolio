import { brandCss } from "@/brand/tokens";
import Link from "next/link";
import { site } from "@/content/site";
import type { ProjectView } from "@/lib/projects/view";
import { Hero } from "./components/hero";
import { LandingMotion } from "./components/landing-motion";
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
        <a href={site.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  );
}

export function ProfessionalLanding({ projects, content = professionalLandingContent }: { projects: ProjectView[]; content?: LandingContent }) {
  return (
    <div id="top" className="rns-landing" data-brand-tone="light" data-motion-enabled={content.motion.enabled}>
      <style>{brandCss + professionalLandingStyles}</style>
      <LandingMotion />
      <div className="rns-opening" data-brand-tone="dark"><SiteHeader note={content.headerNote} /></div>
      <main id="main" tabIndex={-1}>
        <div className="rns-opening" data-brand-tone="dark">
          <Hero projects={projects} content={content} />
        </div>
        <section id="about" className="rns-about" aria-labelledby="rns-about-title">
          <div className="rns-about-inner rns-shell">
          <div className="rns-about-heading" data-reveal><span className="rns-section-label">{content.about.label}</span><h2 id="rns-about-title">{content.about.headline.map((line,index) => <span key={index}>{line}</span>)}</h2></div>
          <div className="rns-about-copy" data-reveal>
            <p>{content.about.statement}</p>
            <p>{content.about.body}</p>
            <a className="rns-text-link" href={site.github} target="_blank" rel="noreferrer">{content.about.linkLabel} <span aria-hidden="true">↗</span></a>
          </div>
          </div>
        </section>
        <WorkIndex projects={projects} content={content.work} />
        <section id="skills" className="rns-skills rns-shell" aria-labelledby="rns-skills-title">
          <div className="rns-section-heading" data-reveal><h2 id="rns-skills-title">{content.skills.headline.map((line,index) => <span key={index}>{line}</span>)}</h2><p>{content.skills.description}</p></div>
          <ul className="rns-capabilities">{content.capabilities.map(item => <li key={item.title} data-reveal><h3>{item.title}</h3><div><p>{item.body}</p><span>{item.tools}</span></div></li>)}</ul>
        </section>
        <section id="contact" className="rns-contact" data-brand-tone="dark" aria-labelledby="rns-contact-title">
          <div className="rns-shell rns-contact-inner"><div data-reveal><span className="rns-section-label">{content.contact.label}</span><h2 id="rns-contact-title">{content.contact.headline.map((line,index) => <span key={index}>{line}</span>)}</h2></div><div className="rns-contact-copy" data-reveal><p>{content.contact.body}</p><MagneticLink href={content.contact.href} external>{content.contact.linkLabel} <span aria-hidden="true">↗</span></MagneticLink></div></div>
        </section>
      </main>
      <footer className="rns-footer rns-shell"><span>© {new Date().getFullYear()} RNS</span><span>Engineering &amp; interface design</span><Link href="#top">Back to top <span aria-hidden="true">↑</span></Link></footer>
    </div>
  );
}
