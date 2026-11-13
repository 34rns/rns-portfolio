"use client";

import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SmartImage } from "@/components/smart-image";
import { ModelStage } from "@/components/model-stage/model-stage";
import { accentInk, onAccent, type SiteSettings } from "@/lib/site-settings/config";
import type { ProjectView } from "@/lib/projects/view";
import { ArrowIcon } from "./icons";
import { studioStyles } from "./studio-styles";
import { StudioCursor } from "./studio-cursor";
import { canAnimateLogo } from "./brand-logo/logo-policy";
const SculptureScene = dynamic(() => import("./sculpture-scene"), { ssr: false });
function subscribeMotion(callback: () => void) {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const noSubscription = () => () => {};
function sculptureCapability() {
  return canAnimateLogo({ reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches, cores: navigator.hardwareConcurrency ?? 8, memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8, saveData: (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ?? false, webgl: typeof WebGL2RenderingContext !== "undefined" });
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function SculptureStage({ settings }: { settings: SiteSettings }) {
  const [paused, setPaused] = useState(!settings.motion);
  const reduced = useSyncExternalStore(subscribeMotion, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  const [visible, setVisible] = useState(true);
  const available = useSyncExternalStore(noSubscription, () => typeof WebGL2RenderingContext !== "undefined", () => false);
  const capable = useSyncExternalStore(subscribeMotion, sculptureCapability, () => false);
  const [forced, setForced] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [turn, setTurn] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = stage.current;
    let inView = true;
    const updateVisibility = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateVisibility(); }, { rootMargin: "100px" });
    if (element) observer.observe(element);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", updateVisibility); };
  }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const onFrame = useCallback((time: number, yaw: number) => { if (stage.current) { stage.current.dataset.time = time.toFixed(3); stage.current.dataset.rotation = yaw.toFixed(3); } }, []);
  const poster = <SmartImage src={!posterFailed && settings.logoUrl ? settings.logoUrl : "/brand/rns-mark-alpha.webp"} alt={settings.name + " identity"} fill sizes="(max-width: 700px) 90vw, 70vw" priority className="studio-logo-poster" onError={() => setPosterFailed(true)} />;
  const active = !paused && !reduced && visible && settings.motion;
  const enhanced = available && (capable || forced);
  if (settings.modelUrl) return <div className="studio-custom-model"><ModelStage modelUrl={settings.modelUrl} lighting="studio" scale={1} offset={[0, 0, 0]} title={settings.name + " sculpture"} poster={settings.logoUrl} /></div>;
  return <div className="studio-sculpture" ref={stage} data-active={active} data-ready={ready} data-exploded={exploded}>
    <div className="studio-orbit" aria-hidden="true" />
    <div className="studio-stage" role="img" aria-label={settings.name + " sculpture. Use the controls below to rotate or disassemble."} onPointerMove={e => {
      if (e.pointerType !== "mouse" || !active) return;
      const r = e.currentTarget.getBoundingClientRect();
      setPointer({ x: (e.clientX - r.left) / r.width * 2 - 1, y: (e.clientY - r.top) / r.height * 2 - 1 });
    }} onPointerLeave={() => setPointer({ x: 0, y: 0 })}>
      {(!ready || failed || !enhanced) && poster}
      {enhanced && !failed && <SceneBoundary fallback={poster} onError={onError}><SculptureScene active={active} exploded={exploded} turn={turn} pointer={pointer} settings={settings} onReady={onReady} onError={onError} onFrame={onFrame} /></SceneBoundary>}
    </div>
    <span className="studio-object-label">01 / THE IDENTITY</span>
    <div className="studio-object-controls" aria-label="Sculpture controls">
      {enhanced && !failed ? <>
        <button onClick={() => setTurn(t => t + 1)} aria-label="Rotate sculpture"><span aria-hidden="true">↻</span></button>
        <button onClick={() => setExploded(v => !v)} aria-pressed={exploded}>{exploded ? "Assemble" : "Disassemble"} <span aria-hidden="true">{exploded ? "−" : "+"}</span></button>
        {settings.motion && !reduced && <button onClick={() => setPaused(v => !v)} aria-pressed={paused}>{paused ? "Play" : "Pause"}</button>}
      </> : available && !failed ? <button onClick={() => setForced(true)}>Explore in 3D +</button> : <span>Static identity</span>}
    </div>
  </div>;
}

function ProjectExplorer({ projects, settings }: { projects: ProjectView[]; settings: SiteSettings }) {
  const initial = Math.max(0, projects.findIndex(p => p.slug === settings.featuredSlug));
  const [selected, setSelected] = useState(initial);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const project = projects[selected] || projects[0];
  const candidate = project?.coverImageUrl || project?.gallery[0];
  const image = candidate && !failedImages.includes(candidate) ? candidate : null;
  if (!project) return <section id="work" className="studio-work studio-shell"><h2>Work in progress.</h2><p>New projects will appear here when they’re published.</p></section>;
  return <section id="work" className="studio-work studio-shell" aria-labelledby="studio-work-title">
    <div className="studio-section-top"><div><span className="studio-kicker">SELECTED WORK / {String(projects.length).padStart(2, "0")}</span><h2 id="studio-work-title">Made to be used.</h2></div><span className="studio-section-note">A few ideas that became real things.<br />Choose a project to look closer.</span></div>
    <div className={"studio-explorer " + settings.projectLayout}>
      <span className="sr-only" aria-live="polite">{project.title} selected. {project.tagline}</span>
      <div className="studio-project-list" role="group" aria-label="Choose a project">{projects.map((p, i) => <button key={p.slug} aria-pressed={selected === i} onClick={() => setSelected(i)} className={selected === i ? "selected" : ""}>
        <span className="studio-project-number">{String(i + 1).padStart(2, "0")}</span><span><strong>{p.title}</strong><small>{p.tags.slice(0, 2).join(" / ") || p.year}</small></span><ArrowIcon />
      </button>)}</div>
      <article className="studio-project-preview" aria-label={project.title + " preview"}>
        <Link href={"/projects/" + project.slug} className={"studio-project-image " + (!image ? "text-cover" : "")} aria-label={"Explore " + project.title}>
          {image ? <SmartImage key={image} src={image} alt={project.title + " interface"} fill sizes="(max-width: 800px) 100vw, 65vw" onError={() => setFailedImages(list => [...list, image])} onLoad={e => { if (e.currentTarget.naturalWidth < 256 || e.currentTarget.naturalHeight < 128) setFailedImages(list => [...list, image]); }} /> : <><span className="studio-kicker">PROJECT / {project.year}</span><span className="studio-text-cover-title">{project.title}</span><ArrowIcon /></>}
          <span className="studio-view-project">Explore project <ArrowIcon /></span>
        </Link>
        <div className="studio-project-caption"><div><span className="studio-kicker">{project.year} / {project.tags.slice(0, 2).join(" · ")}</span><h3>{project.title}</h3><p>{project.tagline}</p></div><Link href={"/projects/" + project.slug} aria-label={"Open " + project.title} className="studio-round-link"><ArrowIcon /></Link></div>
      </article>
    </div>
  </section>;
}
export function InteractiveStudio({ projects, settings }: { projects: ProjectView[]; settings: SiteSettings }) {
  const variables = { "--studio-accent": settings.accent, "--studio-on-accent": onAccent(settings.accent), "--studio-ink": accentInk(settings.accent, settings.appearance), "--studio-title-scale": Math.min(1, 12 / Math.max(settings.heroLineOne.length, settings.heroLineTwo.length)) } as CSSProperties;
  return <div id="top" className="rns-studio" data-appearance={settings.appearance} style={variables}>
    <style>{studioStyles}</style>
    <StudioCursor enabled={settings.motion} />
    <header className="studio-header studio-shell"><Link href="#top" className="studio-wordmark" aria-label={settings.name + " home"}><span className="studio-pixel" aria-hidden="true" /><strong className="studio-name">{settings.name}</strong><span className="studio-wordmark-meta">DESIGN + ENGINEERING</span></Link><nav aria-label="Primary"><Link href="#work">Work <span>{String(projects.length).padStart(2, "0")}</span></Link>{settings.showAbout && <Link href="#about">About</Link>}{settings.showContact && <Link href="#contact" className="studio-nav-contact">Let’s talk <ArrowIcon /></Link>}</nav></header>
    <main id="main" tabIndex={-1}>
      <section className="studio-hero studio-shell" aria-labelledby="studio-title">
        <div className="studio-hero-top"><span className="studio-kicker">{settings.role}</span><span className="studio-kicker studio-hero-note">CURIOUS BY NATURE. BUILT WITH INTENT.</span></div>
        <div className="studio-hero-composition"><h1 id="studio-title">{settings.heroLineOne}<br /><span>{settings.heroLineTwo}</span></h1><SculptureStage settings={settings} /><span className="studio-vertical-label" aria-hidden="true">INDEPENDENT / INTERACTIVE / RNS</span></div>
        <div className="studio-hero-bottom"><div className="studio-introduction"><span className="studio-pixel" aria-hidden="true" /><p>{settings.introduction}</p></div><Link href="#work" className="studio-work-link">Discover the work <span aria-hidden="true">↓</span></Link></div>
      </section>
      <ProjectExplorer projects={projects} settings={settings} />
      {settings.showAbout && <section id="about" className="studio-about studio-shell"><span className="studio-kicker">02 / THE PERSON BEHIND THE PIXELS</span><div className="studio-about-grid"><h2>{settings.aboutTitle}</h2><div><p>{settings.aboutBody}</p><a href={settings.githubUrl} target="_blank" rel="noreferrer" className="studio-text-link">More on GitHub <ArrowIcon /></a><div className="studio-practice"><span>01 / Interfaces</span><span>02 / Useful tools</span><span>03 / Experiments</span></div></div></div></section>}
      {settings.showContact && <section id="contact" className="studio-contact"><div className="studio-shell"><span className="studio-kicker">03 / WHAT’S NEXT?</span><a href={settings.contactUrl} className="studio-contact-title"><h2>{settings.contactTitle}</h2><ArrowIcon /></a><div className="studio-contact-bottom"><p>{settings.contactBody}</p><a href={settings.contactUrl}>{settings.contactLabel} <ArrowIcon /></a></div></div></section>}
    </main>
    <footer className="studio-footer studio-shell"><span>© {new Date().getFullYear()} {settings.name}</span><span>Made with curiosity.</span><Link href="#top">Back to top ↑</Link></footer>
  </div>;
}
