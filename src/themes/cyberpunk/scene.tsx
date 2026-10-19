"use client";

import { useEffect, useRef } from "react";
import { advanceTrace, frameCode } from "./trace";

/**
 * Deterministic skyline: index arithmetic, not Math.random, so the server and
 * client draw the same canyon.
 */
const blocks = Array.from({ length: 30 }, (_, index) => ({
  left: (index * 37) % 100,
  width: 3 + ((index * 13) % 9),
  height: 16 + ((index * 29) % 54),
  opacity: 0.2 + ((index * 7) % 5) * 0.07,
  lit: index % 4 === 0,
  delay: `-${((index * 11) % 40) / 10}s`,
}));

/**
 * One fixed backdrop for the whole theme: a night skyline, a slow data trace,
 * a large finder ring and the scroll progress line. The only animated value
 * written from JavaScript is a wrapped scan offset, so the loop is a single
 * style write per frame and parks when the tab is hidden.
 */
export function CyberScene() {
  const scene = useRef<HTMLDivElement>(null);
  const code = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = scene.current;
    if (!node) return;
    const root = node.closest<HTMLElement>(".cyber-root");
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    let offset = 0;
    let lastY = window.scrollY;
    let running = false;

    const paintScroll = () => {
      const span = document.documentElement.scrollHeight - window.innerHeight;
      const progress = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
      root.style.setProperty("--cyber-progress", progress.toFixed(4));

      // The backdrop is a hero surface; fade it back before the dossier starts
      // so the skyline never competes with body copy.
      const depth = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.95));
      root.style.setProperty("--cyber-depth", depth.toFixed(3));

      if (code.current) code.current.textContent = frameCode(progress);
    };

    const tick = (now: number) => {
      const dt = Math.max(1, now - last);
      last = now;
      const y = window.scrollY;
      const velocity = (y - lastY) / Math.min(dt, 64);
      lastY = y;

      offset = advanceTrace({ offset, dtMs: dt, velocity });
      root.style.setProperty("--cyber-trace-y", `${offset.toFixed(2)}px`);
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const start = () => {
      if (running || reduce.matches || document.hidden) return;
      running = true;
      last = performance.now();
      lastY = window.scrollY;
      frame = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const onMotion = () => {
      if (reduce.matches) {
        stop();
        root.style.setProperty("--cyber-trace-y", "0px");
      } else {
        start();
      }
    };

    paintScroll();
    start();

    window.addEventListener("scroll", paintScroll, { passive: true });
    window.addEventListener("resize", paintScroll);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onMotion);

    return () => {
      stop();
      window.removeEventListener("scroll", paintScroll);
      window.removeEventListener("resize", paintScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div ref={scene} className="cyber-scene" aria-hidden="true">
      <div className="cyber-scene-glow" />

      <div className="cyber-skyline">
        {blocks.map((block, index) => (
          <span
            key={index}
            className="cyber-block"
            style={{
              left: `${block.left}%`,
              width: `${block.width}%`,
              height: `${block.height}%`,
              opacity: block.opacity,
            }}
          >
            {block.lit ? (
              <span
                className="cyber-block-lit"
                style={{ animationDelay: block.delay }}
              />
            ) : null}
          </span>
        ))}
      </div>

      <div className="cyber-cables">
        <span />
        <span />
        <span />
      </div>

      <div className="cyber-trace" />
      <div className="cyber-scanlines" />
      <div className="cyber-reticle" />
      <div className="cyber-scene-vignette" />

      <p className="cyber-scene-code">
        <span ref={code}>0000</span> <span>/ FRAME</span>
      </p>

      <div className="cyber-progress">
        <span />
      </div>
    </div>
  );
}
