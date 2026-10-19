"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { SmartImage } from "@/components/smart-image";
import type { LightingPreset } from "@/lib/projects/model";

const Viewer = dynamic(() => import("./viewer").then((module) => module.Viewer), {
  ssr: false,
});

const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeCapability(onChange: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getCapability() {
  const reduce = window.matchMedia(motionQuery).matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return !reduce && cores > 4 && memory >= 4;
}

function getServerCapability() {
  return false;
}

class StageBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export type ModelStageProps = {
  modelUrl: string | null;
  lighting: LightingPreset;
  scale: number;
  offset: [number, number, number];
  variant?: "studio" | "toon";
  title: string;
  poster?: string | null;
  className?: string;
};

/**
 * Loads three.js only when the stage is near the viewport, and never for
 * visitors who asked for reduced motion or are on a low-power device. Those
 * visitors get a real poster and can opt in with one click.
 */
export function ModelStage({
  modelUrl,
  lighting,
  scale,
  offset,
  variant = "studio",
  title,
  poster,
  className = "",
}: ModelStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const capable = useSyncExternalStore(
    subscribeCapability,
    getCapability,
    getServerCapability,
  );
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(true);
  const [forced, setForced] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const span = window.innerHeight + rect.height;
      const progressValue = (window.innerHeight - rect.top) / span;
      scrollRef.current = Math.min(1, Math.max(0, progressValue));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const active = (capable || forced) && near && !failed;
  const showPoster = !active || !ready;

  return (
    <div
      ref={containerRef}
      data-model-stage={variant}
      className={`relative isolate w-full min-w-0 overflow-hidden bg-[var(--theme-surface)] ${className}`}
      role="group"
      aria-label={`${title} — interactive 3D model. Drag to orbit.`}
    >
      {active ? (
        <StageBoundary onError={() => setFailed(true)}>
          <Viewer
            url={modelUrl}
            lighting={lighting}
            scale={scale}
            offset={offset}
            variant={variant}
            active={visible && !failed}
            scrollRef={scrollRef}
            onProgress={setProgress}
            onReady={() => setReady(true)}
          />
        </StageBoundary>
      ) : null}

      {showPoster ? (
        <div data-model-poster className="absolute inset-0">
          {poster ? (
            <SmartImage
              src={poster}
              alt=""
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "9px 9px",
                color: "var(--theme-line)",
                opacity: 0.55,
              }}
            />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(10,10,12,0.06)_100%)]" />

          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5">
            <div>
              <p className="mono opacity-60">
                {!capable && !forced
                  ? "Static preview · reduced motion"
                  : "Static preview"}
              </p>
              <p className="display mt-1 text-[1.4rem] font-semibold uppercase tracking-tight">
                {title}
              </p>
            </div>

            {!active && !failed ? (
              <button
                type="button"
                onClick={() => setForced(true)}
                className="border border-current px-3 py-1.5 text-xs font-medium uppercase tracking-wide"
              >
                Load 3D
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {active && !ready ? (
        <div
          data-model-progress
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 bg-[color-mix(in_srgb,var(--theme-text)_78%,transparent)] px-5 py-3 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--theme-bg)]"
        >
          <span>Loading 3D</span>
          <span className="h-px flex-1 bg-current opacity-30">
            <span
              className="block h-px bg-current"
              style={{ width: `${Math.max(6, progress)}%` }}
            />
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
      ) : null}

      {active && ready ? (
        <p className="pointer-events-none absolute bottom-3 right-4 text-[0.66rem] uppercase tracking-[0.16em] opacity-55">
          Drag to orbit
        </p>
      ) : null}
    </div>
  );
}
