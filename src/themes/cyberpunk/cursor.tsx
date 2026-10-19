"use client";

import { useEffect, useRef } from "react";

/**
 * A four-corner reticle with a live coordinate readout. One rAF loop writes a
 * single transform, so pointer movement never re-renders React. Fine pointers
 * only, and never under reduced motion where the native cursor stays.
 */
export function CyberCursor() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = node.closest<HTMLElement>(".cyber-root");
    if (!root) return;

    const reticle = node.querySelector<HTMLElement>(".cyber-cursor-reticle");
    const xLabel = node.querySelector<HTMLElement>(".cyber-cursor-x");
    const yLabel = node.querySelector<HTMLElement>(".cyber-cursor-y");
    if (!reticle) return;

    let x = -100;
    let y = -100;
    let frame = 0;
    let visible = false;

    root.classList.add("cyber-cursor-on");
    node.dataset.active = "false";

    const render = () => {
      frame = 0;
      reticle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (xLabel) xLabel.textContent = String(Math.round(x)).padStart(4, "0");
      if (yLabel) yLabel.textContent = String(Math.round(y)).padStart(4, "0");
    };

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        visible = true;
        node.dataset.active = "true";
      }
      node.dataset.hover = (event.target as HTMLElement | null)?.closest(
        "a, button, [data-cursor], summary",
      )
        ? "true"
        : "false";
      wake();
    };

    const onLeave = () => {
      visible = false;
      node.dataset.active = "false";
      node.dataset.hover = "false";
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
      root.classList.remove("cyber-cursor-on");
      node.dataset.active = "false";
      node.dataset.hover = "false";
    };
  }, []);

  return (
    <div
      ref={host}
      className="cyber-cursor"
      data-active="false"
      data-hover="false"
      aria-hidden="true"
    >
      <span className="cyber-cursor-reticle">
        <span className="cyber-cursor-ring" />
        <span className="cyber-cursor-lock">LOCK</span>
        <span className="cyber-cursor-coord">
          X<span className="cyber-cursor-x">0000</span>
          {" / "}Y<span className="cyber-cursor-y">0000</span>
        </span>
      </span>
    </div>
  );
}
