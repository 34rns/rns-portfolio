"use client";

import { useEffect, useRef } from "react";
import { ArrowIcon } from "./icons";

/** A logo-inspired pointer companion; never intercepts clicks or replaces text selection. */
export function StudioCursor({ enabled }: { enabled: boolean }) {
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = cursor.current;
    const root = node?.closest<HTMLElement>(".rns-landing");
    if (!node || !root || !enabled) return;
    const media = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)");
    let frame = 0;
    let point: { x: number; y: number } | null = null;
    const hide = () => { node.dataset.visible = "false"; delete node.dataset.pressed; point = null; };
    const policy = () => {
      if (media.matches) root.dataset.studioCursor = "on";
      else { delete root.dataset.studioCursor; hide(); }
    };
    const draw = () => {
      frame = 0;
      if (!point || !media.matches) return;
      const target = document.elementFromPoint(point.x, point.y);
      const control = target?.closest("a,button,[role='button']");
      const blocked = target?.closest("input,textarea,select,[contenteditable]:not([contenteditable='false'])")
        || control?.matches(":disabled,[aria-disabled='true']")
        || (!control && target?.closest("h1,h2,h3,p"));
      if (!target || !root.contains(target) || blocked || document.getSelection()?.isCollapsed === false) {
        node.dataset.visible = "false";
        return;
      }
      node.dataset.mode = target.closest(".rns-project-link,.rns-scene-link") ? "view" : control ? "action" : "idle";
      node.dataset.tone = target.closest("[data-brand-tone]")?.getAttribute("data-brand-tone") ?? "light";
      node.style.transform = `translate3d(${Math.min(point.x + 20, innerWidth - 96)}px,${Math.min(point.y + 20, innerHeight - 48)}px,0)`;
      node.dataset.visible = "true";
    };
    const schedule = () => { if (point && !frame) frame = requestAnimationFrame(draw); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") { hide(); return; }
      point = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const press = () => { node.dataset.pressed = "true"; };
    const release = () => { delete node.dataset.pressed; };
    policy();
    media.addEventListener("change", policy);
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", hide);
    root.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("blur", hide);
    document.addEventListener("keydown", hide);
    document.addEventListener("visibilitychange", hide);
    return () => {
      cancelAnimationFrame(frame);
      delete root.dataset.studioCursor;
      media.removeEventListener("change", policy);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", hide);
      root.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("blur", hide);
      document.removeEventListener("keydown", hide);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [enabled]);

  return <div ref={cursor} className="rns-studio-cursor" aria-hidden="true" data-visible="false" data-mode="idle">
    <div className="rns-cursor-chip"><i /><i /><i /><span>View <ArrowIcon /></span></div>
  </div>;
}
