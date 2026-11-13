import { brandCss } from "@/brand/tokens";
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
      <span className="rns-header-note">Independent work, considered from end to end.</span>
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
      <div className="rns-opening" data-brand-tone="dark"><SiteHeader /></div>
      <main id="main" tabIndex={-1}>
        <div className="rns-opening" data-brand-tone="dark">
          <Hero projects={projects} />
          <div className="rns-opening-foot rns-shell"><span>Product engineering</span><span>Interface design</span><Link href="#work">Discover the work <span aria-hidden="true">↓</span></Link></div>
        </div>
        <section id="about" className="rns-about rns-shell" aria-labelledby="rns-about-title">
          <div className="rns-about-heading" data-reveal><span className="rns-section-label">The approach</span><h2 id="rns-about-title">Good software<br />has a human side.</h2></div>
          <div className="rns-about-copy" data-reveal>
            <p>It should feel clear, respond with care, and earn its place in your day.</p>
            <p>Most of what I build starts in the browser and ends in production. Commerce, everyday tools, a Bengali keyboard, and the occasional Unity detour. Different mediums, the same care.</p>
            <a className="rns-text-link" href={site.github} target="_blank" rel="noreferrer">Explore my repositories <span aria-hidden="true">↗</span></a>
          </div>
        </section>
        <WorkIndex projects={projects} />
        <section id="skills" className="rns-skills rns-shell" aria-labelledby="rns-skills-title">
          <div className="rns-section-heading" data-reveal><h2 id="rns-skills-title">The whole build.<br />Every detail.</h2><p>Design, engineering, and everything between.</p></div>
          <ul className="rns-capabilities">{capabilities.map(item => <li key={item.title} data-reveal><h3>{item.title}</h3><div><p>{item.body}</p><span>{item.tools}</span></div></li>)}</ul>
        </section>
        <section id="contact" className="rns-contact" data-brand-tone="dark" aria-labelledby="rns-contact-title">
          <div className="rns-shell rns-contact-inner"><div data-reveal><span className="rns-section-label">Have a project in mind?</span><h2 id="rns-contact-title">Make it<br />mean something.</h2></div><div className="rns-contact-copy" data-reveal><p>Tell me about the idea, the people it&apos;s for, and the problem worth solving.</p><MagneticLink href={site.github} external>Start a conversation <span aria-hidden="true">↗</span></MagneticLink></div></div>
        </section>
      </main>
      <footer className="rns-footer rns-shell"><span>© {new Date().getFullYear()} RNS</span><span>Engineering &amp; interface design</span><Link href="#top">Back to top <span aria-hidden="true">↑</span></Link></footer>
    </div>
  );
}
