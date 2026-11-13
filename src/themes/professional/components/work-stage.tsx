"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { SmartImage } from "@/components/smart-image";
import type { ProjectView } from "@/lib/projects/view";
import type { LandingContent } from "../landing-content";

type StageProject = Pick<ProjectView, "slug" | "title" | "tagline" | "year" | "tags" | "coverImageUrl">;
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function Preview({ project, priority = false }: { project: StageProject; priority?: boolean }) {
  return (
    <div className="rns-scene-image">
      {project.coverImageUrl
        ? <SmartImage src={project.coverImageUrl} alt="" fill priority={priority} sizes="(max-width:700px) 85vw, (max-width:1000px) 75vw, 850px" className="rns-scene-cover" />
        : <div className="rns-scene-fallback"><span>{project.year}</span><strong>{project.title}</strong><span>{project.tags.slice(0, 3).join(" / ")}</span></div>}
    </div>
  );
}

export function WorkStage({ projects, content, motion }: {
  projects: StageProject[];
  content: LandingContent["showcase"];
  motion: LandingContent["motion"];
}) {
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(motionQuery).matches, () => true);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const id = useId();
  const running = motion.enabled && !reduced && !paused;
  const intensity = Math.max(0, Math.min(1, motion.intensity));

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function reset() {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    scene.current?.style.setProperty("--scene-rx", "0deg");
    scene.current?.style.setProperty("--scene-ry", "0deg");
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!running || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    point.current = {
      x: Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)),
      y: Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)),
    };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      scene.current?.style.setProperty("--scene-rx", `${point.current.y * -3 * intensity}deg`);
      scene.current?.style.setProperty("--scene-ry", `${point.current.x * 5 * intensity}deg`);
      frame.current = 0;
    });
  }
  function choose(index: number, focus = false) {
    reset();
    setSelected(index);
    if (focus) tabs.current[index]?.focus();
  }
  function keys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % projects.length
      : event.key === "ArrowLeft" ? (index - 1 + projects.length) % projects.length
        : event.key === "Home" ? 0 : event.key === "End" ? projects.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    choose(next, true);
  }

  if (!projects.length) return null;
  const activeIndex = Math.min(selected, projects.length - 1);
  const active = projects[activeIndex];
  const previousIndex = (activeIndex - 1 + projects.length) % projects.length;
  const nextIndex = (activeIndex + 1) % projects.length;
  const previous = projects[previousIndex];
  const next = projects[nextIndex];

  return (
    <div className="rns-showcase" role="region" aria-roledescription="carousel" aria-label={content.label}>
      <div className="rns-showcase-top rns-shell">
        <span>{content.label}</span>
        <div className="rns-showcase-controls">
          <button type="button" disabled={!motion.enabled || reduced} aria-pressed={paused} onClick={() => { reset(); setPaused(value => !value); }}>
            {!motion.enabled || reduced ? "Motion off" : paused ? "Play motion" : "Pause motion"}
          </button>
          <span className="rns-showcase-position" aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
          <button className="rns-arrow-control" type="button" aria-label="Preview previous project" disabled={projects.length < 2} onClick={() => choose(previousIndex)}>←</button>
          <button className="rns-arrow-control" type="button" aria-label="Preview next project" disabled={projects.length < 2} onClick={() => choose(nextIndex)}>→</button>
        </div>
      </div>
      <div className="rns-showcase-tabs rns-shell" role="tablist" aria-label="Choose a project preview">
        {projects.map((project, index) => <button key={project.slug} ref={node => { tabs.current[index] = node; }} type="button" role="tab" id={id + "-tab-" + index} aria-controls={id + "-panel"} aria-selected={activeIndex === index} tabIndex={activeIndex === index ? 0 : -1} onClick={() => choose(index)} onKeyDown={event => keys(event, index)}>{project.title}</button>)}
      </div>
      <div className="rns-scene-shell">
        <div ref={scene} className="rns-scene" data-running={running} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
          <svg className="rns-scene-ribbon" viewBox="0 0 1440 560" fill="none" aria-hidden="true">
            <path d="M-100 430C190 95 575 525 1000 320S1300 70 1540 240" />
            <path className="rns-scene-signal" d="M-100 430C190 95 575 525 1000 320S1300 70 1540 240" />
          </svg>
          {projects.length > 1 && <button className="rns-scene-peek rns-scene-peek-left" type="button" aria-label={`Preview ${previous.title}`} onClick={() => choose(previousIndex)}><Preview project={previous} /><span>{previous.title}</span></button>}
          <div className="rns-scene-front" key={active.slug} role="tabpanel" id={id + "-panel"} aria-labelledby={id + "-tab-" + activeIndex}>
            <Link className="rns-scene-link" href={`/projects/${active.slug}`} prefetch={false} aria-label={`${content.linkLabel}: ${active.title}`}>
              <div className="rns-scene-chrome" aria-hidden="true"><span><i /><i /><i /></span><span>{active.title}</span><span>↗</span></div>
              <Preview project={active} priority={activeIndex === 0} />
            </Link>
          </div>
          {projects.length > 2 && <button className="rns-scene-peek rns-scene-peek-right" type="button" aria-label={`Preview ${next.title}`} onClick={() => choose(nextIndex)}><Preview project={next} /><span>{next.title}</span></button>}
        </div>
      </div>
      <div className="rns-showcase-caption rns-shell">
        <div><h2>{active.title}</h2><p>{active.tagline}</p></div>
        <Link className="rns-text-link" href={`/projects/${active.slug}`} prefetch={false}>{content.linkLabel} <span aria-hidden="true">↗</span></Link>
      </div>
      <p className="rns-sr-only" role="status">{active.title}, project {activeIndex + 1} of {projects.length}</p>
    </div>
  );
}
