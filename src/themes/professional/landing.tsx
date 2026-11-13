import { brandCss } from "@/brand/tokens";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { ProjectView } from "@/lib/projects/view";
import { Hero } from "./components/hero";
import { LandingMotion } from "./components/landing-motion";
import { MagneticLink } from "./components/magnetic-link";
import { WorkIndex } from "./components/work-index";
import { professionalLandingStyles } from "./landing-styles";

const capabilities = [
  { title: "Product engineering", tools: "Next.js / TypeScript / Postgres", body: "The interface, the data, the authentication, and the path to production. One connected system." },
  { title: "Interface design", tools: "Typography / Layout / Design systems", body: "Clear hierarchy and considered details that hold up on real screens, with real content." },
  { title: "Motion & interaction", tools: "Scroll / Transitions / Micro-interactions", body: "Movement that makes an interface easier to understand, with a quieter path when you need it." },
  { title: "Games & 3D", tools: "Unity / C# / Shaders", body: "A different medium for the same craft: responsive scenes, character rigs, and playful experiments." },
];

function SiteHeader() {
  return (
    <header className="rns-header rns-shell">
      <Link className="rns-brand" href="#top" aria-label="RNS home">
        <Image src="/brand/rns-mark.svg" alt="" width={72} height={29} unoptimized />
        <span className="rns-wordmark">34rns</span>
      </Link>
      <nav aria-label="Primary">
        <Link href="#work">Work</Link><Link href="#about">About</Link><Link href="#contact">Contact</Link>
        <a href={site.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  );
}

export function ProfessionalLanding({ projects }: { projects: ProjectView[] }) {
  return (
    <div id="top" className="rns-landing" data-brand-tone="light">
      <style>{brandCss + professionalLandingStyles}</style>
      <LandingMotion />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Hero latest={projects[0]} />
        <section id="about" className="rns-about rns-shell" aria-labelledby="rns-about-title">
          <div className="rns-about-heading" data-reveal><span className="rns-section-label">About</span><h2 id="rns-about-title">From interface<br />to infrastructure.</h2></div>
          <div className="rns-about-copy" data-reveal>
            <p>My work sits where product engineering meets interface design. I care as much about the database and deployment as the spacing, response, and feel.</p>
            <p>Most of what I build starts in the browser and ends in production. Commerce, everyday tools, a Bengali keyboard, and the occasional Unity detour. Different mediums, the same care.</p>
            <a className="rns-text-link" href={site.github} target="_blank" rel="noreferrer">Explore my repositories <span aria-hidden="true">↗</span></a>
          </div>
        </section>
        <WorkIndex projects={projects} />
        <section id="skills" className="rns-skills rns-shell" aria-labelledby="rns-skills-title">
          <div className="rns-section-heading" data-reveal><h2 id="rns-skills-title">What I bring<br />to a build.</h2><p>From the first sketch to the last detail.</p></div>
          <ul className="rns-capabilities">{capabilities.map(item => <li key={item.title} data-reveal><h3>{item.title}</h3><div><p>{item.body}</p><span>{item.tools}</span></div></li>)}</ul>
        </section>
        <section id="contact" className="rns-contact" data-brand-tone="dark" aria-labelledby="rns-contact-title">
          <div className="rns-shell rns-contact-inner"><div data-reveal><span className="rns-section-label">Have a project in mind?</span><h2 id="rns-contact-title">Let&apos;s make<br />something useful.</h2></div><div className="rns-contact-copy" data-reveal><p>The fastest way to reach me is on GitHub. Share what you&apos;re working on, and let&apos;s start there.</p><MagneticLink href={site.github} external>@{site.handle} <span aria-hidden="true">↗</span></MagneticLink></div></div>
        </section>
      </main>
      <footer className="rns-footer rns-shell"><span>© {new Date().getFullYear()} RNS</span><span>Engineering &amp; interface design</span><Link href="#top">Back to top <span aria-hidden="true">↑</span></Link></footer>
    </div>
  );
}
