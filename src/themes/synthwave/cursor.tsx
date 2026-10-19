"use client";

import { useEffect, useRef } from "react";

const SPARK_COUNT = 8;

/**
 * Pixel crosshair with a short sparkle trail. Positions are written straight
 * to the DOM from one rAF loop, so moving the mouse never re-renders React.
 * The loop parks itself after a moment of stillness and the whole effect is
 * skipped for coarse pointers and reduced motion (where the native cursor
 * stays exactly where it was).
 */
export function SynthCursor() {
  const host = useRef<HTMLDivElement>(null);
  const sparkRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = node.closest<HTMLElement>(".synth-root");
    if (!root) return;

    const cross = node.querySelector<HTMLElement>(".synth-cursor-cross");
    const sparks = sparkRefs.current.filter(
      (spark): spark is HTMLSpanElement => spark !== null,
    );
    const trail = sparks.map(() => ({ x: -100, y: -100 }));

    let x = -100;
    let y = -100;
    let frame = 0;
    let lastMove = 0;

    root.classList.add("synth-cursor-on");
    node.dataset.active = "true";

    const render = (now: number) => {
      frame = 0;

      if (cross) {
        cross.style.left = `${x}px`;
        cross.style.top = `${y}px`;
      }

      let leaderX = x;
      let leaderY = y;

      trail.forEach((point, index) => {
        point.x += (leaderX - point.x) * 0.32;
        point.y += (leaderY - point.y) * 0.32;

        const spark = sparks[index];
        if (spark) {
          spark.style.transform = `translate3d(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px, 0)`;
          spark.style.opacity = `${Math.max(0.12, 0.62 - index * 0.06)}`;
        }

        leaderX = point.x;
        leaderY = point.y;
      });

      if (now - lastMove < 620) {
        frame = requestAnimationFrame(render);
      } else {
        for (const spark of sparks) spark.style.opacity = "0";
      }
    };

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      lastMove = performance.now();
      node.dataset.active = "true";
      node.dataset.hover = (event.target as HTMLElement | null)?.closest(
        "a, button, [data-cursor], summary",
      )
        ? "true"
        : "false";
      wake();
    };

    const onLeave = () => {
      node.dataset.active = "false";
      node.dataset.hover = "false";
      for (const spark of sparks) spark.style.opacity = "0";
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove("synth-cursor-on");
      node.dataset.active = "false";
      node.dataset.hover = "false";
    };
  }, []);

  return (
    <div
      ref={host}
      className="synth-cursor"
      data-active="false"
      data-hover="false"
      aria-hidden="true"
    >
      <span className="synth-cursor-cross" />
      {Array.from({ length: SPARK_COUNT }, (_, index) => (
        <span
          key={index}
          ref={(element) => {
            sparkRefs.current[index] = element;
          }}
          className="synth-cursor-spark"
        />
      ))}
    </div>
  );
}
