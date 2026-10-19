"use client";

import { useEffect, useRef } from "react";
import { advanceGrid, scrollVelocity } from "./motion";

/**
 * Deterministic star field: no Math.random at render time, so the server and
 * client mark up the same sky.
 */
const stars = Array.from({ length: 34 }, (_, index) => ({
  left: ((index * 37 + 11) % 96) + 2,
  top: ((index * 23 + 5) % 50) + 3,
  size: 1 + (index % 3) * 0.8,
  delay: ((index * 7) % 43) / 10,
}));

export function SynthScene() {
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scene.current;
    if (!node) return;
    const root = node.closest<HTMLElement>(".synth-root");
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    let lastY = window.scrollY;
    let offset = 0;
    let velocity = 0;
    let running = false;

    const paintScroll = () => {
      const span = document.documentElement.scrollHeight - window.innerHeight;
      const progress = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
      root.style.setProperty("--synth-progress", progress.toFixed(4));

      const above = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
      root.style.setProperty(
        "--synth-sun-shift",
        reduce.matches ? "0px" : `${(-above * 26).toFixed(2)}px`,
      );

      // The scene is fixed, so fade it back once the case file is in view;
      // the sunset is a hero backdrop, not a wash over the body copy.
      const depth = Math.max(0, 1 - window.scrollY / (window.innerHeight * 1.1));
      root.style.setProperty("--synth-depth", depth.toFixed(3));
    };

    const tick = (now: number) => {
      const dt = Math.max(1, now - last);
      last = now;
      const y = window.scrollY;
      velocity = scrollVelocity(lastY, y, dt);
      lastY = y;

      const next = advanceGrid({ offset, velocity, dtMs: dt });
      offset = next.offset;
      velocity = next.velocity;
      root.style.setProperty("--synth-grid-y", `${offset.toFixed(2)}px`);

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
        root.style.setProperty("--synth-grid-y", "0px");
        root.style.setProperty("--synth-sun-shift", "0px");
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
    <div ref={scene} className="synth-scene" aria-hidden="true">
      <div className="synth-stars">
        {stars.map((star, index) => (
          <span
            key={index}
            className="synth-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="synth-sun" />
      <div className="synth-floor">
        <div className="synth-grid" />
        <div className="synth-horizon" />
      </div>
      <div className="synth-scanlines" />
      <div className="synth-vignette" />

      <div className="synth-progress">
        <span />
      </div>
    </div>
  );
}
