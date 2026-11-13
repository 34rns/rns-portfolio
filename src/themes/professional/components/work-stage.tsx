"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { SmartImage } from "@/components/smart-image";
import type { ProjectView } from "@/lib/projects/view";

type StageProject = Pick<ProjectView, "slug" | "title" | "coverImageUrl">;
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export function WorkStage({ projects, logo }: { projects: StageProject[]; logo: ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(motionQuery).matches, () => true);
  const [paused, setPaused] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const running = !reduced && !paused;

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function reset() {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    stage.current?.style.setProperty("--stage-x", "0px");
    stage.current?.style.setProperty("--stage-y", "0px");
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!running || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    point.current = {
      x: Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)) * 16,
      y: Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)) * 12,
    };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      stage.current?.style.setProperty("--stage-x", `${point.current.x}px`);
      stage.current?.style.setProperty("--stage-y", `${point.current.y}px`);
      frame.current = 0;
    });
  }

  return (
    <div className="rns-stage-wrap">
      <div ref={stage} className="rns-stage" data-running={running} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset} role="group" aria-label="RNS and selected project previews">
        <svg className="rns-stage-orbit" viewBox="0 0 640 560" fill="none" aria-hidden="true">
          <ellipse cx="320" cy="280" rx="281" ry="177" transform="rotate(-28 320 280)" />
          <ellipse cx="320" cy="280" rx="246" ry="225" transform="rotate(18 320 280)" />
          <path className="rns-stage-signal" d="M60 390C160 455 520 350 577 144" />
          <circle cx="60" cy="390" r="5" /><circle cx="577" cy="144" r="5" />
        </svg>
        <figure className="rns-logo-stage" data-logo-slot="future-3d">
          {/* Future 3D mount: preserve this stage's dimensions. The logo stays a static image. */}
          {logo}
        </figure>
        {projects.filter(project => project.coverImageUrl).slice(0, 4).map((project, index) => (
          <div key={project.slug} className={`rns-stage-tile rns-stage-tile-${index + 1}`}>
            <Link href={`/projects/${project.slug}`} className="rns-stage-link" prefetch={false}>
              <div className="rns-stage-image"><SmartImage src={project.coverImageUrl!} alt="" fill sizes="(max-width:700px) 130px, 220px" /></div>
              <span>{project.title}<span aria-hidden="true">↗</span></span>
            </Link>
          </div>
        ))}
      </div>
      <div className="rns-stage-caption">
        <span>Real projects. A shared point of view.</span>
        <button type="button" disabled={reduced} aria-pressed={paused} onClick={() => { reset(); setPaused(value => !value); }}>
          <span className="rns-motion-indicator" aria-hidden="true"><i /><i /><i /></span>
          {reduced ? "Motion off" : paused ? "Play motion" : "Pause motion"}
        </button>
      </div>
    </div>
  );
}
