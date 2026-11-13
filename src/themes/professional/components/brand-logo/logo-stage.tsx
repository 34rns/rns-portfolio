"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { canAnimateLogo } from "./logo-policy";

const Scene = dynamic(() => import("./logo-scene").then(module => module.LogoScene), { ssr: false });
const introKey = "rns-logo-intro-v1";
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribe(listener: () => void) {
  const media = matchMedia(motionQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
function capable() {
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return canAnimateLogo({ reducedMotion: matchMedia(motionQuery).matches, cores: device.hardwareConcurrency ?? 8, memory: device.deviceMemory ?? 8, saveData: !!device.connection?.saveData, webgl: true });
}
class LogoBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function LogoStage({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const canMove = useSyncExternalStore(subscribe, capable, () => false) && enabled;
  const root = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const [admitted, setAdmitted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);
  const [phase, setPhase] = useState("poster");
  const [spin, setSpin] = useState(0);
  const [bytes, setBytes] = useState(0);
  const frameCount = useRef(0);
  const active = canMove && admitted && ready && inView && tabVisible && !paused && !failed;
  const onError = useCallback(() => setFailed(true), []);
  const onFrame = useCallback((data: { time: number; tilt: string; holes: number; parts: number }) => {
    if (!root.current) return;
    root.current.dataset.logoFrames = String(++frameCount.current);
    root.current.dataset.logoTime = data.time.toFixed(3);
    root.current.dataset.logoTilt = data.tilt;
    root.current.dataset.logoHoles = String(data.holes);
    root.current.dataset.logoParts = String(data.parts);
  }, []);
  const onReady = useCallback((size: number) => { setBytes(size); setReady(true); setPhase("intro"); }, []);
  const onIdle = useCallback(() => {
    setPhase("idle");
    try { sessionStorage.setItem(introKey, "seen"); } catch { /* Storage can be unavailable in private contexts. */ }
  }, []);

  const admit = useCallback(() => {
    if (!canMove || failed) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    if (!context) { setFailed(true); return; }
    context.getExtension("WEBGL_lose_context")?.loseContext();
    try { setSkipIntro(sessionStorage.getItem(introKey) === "seen"); } catch { /* The intro remains repeatable without storage. */ }
    setAdmitted(true);
  }, [canMove, failed]);

  useEffect(() => {
    if (!canMove || admitted || !inView || matchMedia("(pointer:coarse)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const idle = window.requestIdleCallback?.(() => { timer = setTimeout(admit, 1000); }, { timeout: 2500 });
    if (!window.requestIdleCallback) timer = setTimeout(admit, 2000);
    return () => { clearTimeout(timer); if (idle !== undefined) window.cancelIdleCallback(idle); };
  }, [canMove, admitted, inView, admit]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .05 });
    observer.observe(node);
    const visibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    visibility();
    const contextLost = (event: Event) => { event.preventDefault(); setFailed(true); };
    node.addEventListener("webglcontextlost", contextLost, true);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); node.removeEventListener("webglcontextlost", contextLost, true); };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = root.current?.closest(".rns-hero");
      if (!hero || !visual.current) return;
      const progress = canMove && ready && !failed ? Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / Math.min(innerHeight * .8, 650))) : 0;
      scroll.current = progress;
      visual.current.style.transform = `translate3d(${progress * 28}px,${progress * 40}px,0) scale(${1 - progress * .18})`;
      visual.current.style.opacity = String(1 - progress * .78);
      root.current!.dataset.logoScroll = progress.toFixed(3);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", schedule, { passive: true }); window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, [canMove, ready, failed]);

  const show3D = canMove && admitted && !failed;
  return <div ref={root} className="rns-logo-interactive" data-logo-phase={!canMove || failed ? "static" : ready ? phase : "poster"} data-logo-active={active} data-logo-geometry-bytes={bytes}
    onPointerMove={event => { if (paused || !canMove || event.pointerType !== "mouse") return; const bounds = event.currentTarget.getBoundingClientRect(); pointer.current = { x: Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)), y: Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1)) }; }}
    onPointerLeave={() => { pointer.current = { x: 0, y: 0 }; }}>
    <div ref={visual} className="rns-logo-visual">
      <div className="rns-logo-poster" style={{ opacity: show3D && ready ? 0 : 1 }}>{children}</div>
      {show3D && <div className="rns-logo-canvas" aria-hidden="true" style={{ opacity: ready ? 1 : 0 }}><LogoBoundary onError={onError}><Scene active={inView && tabVisible && !paused} pointer={pointer} scroll={scroll} skipIntro={skipIntro} spin={spin} onReady={onReady} onIdle={onIdle} onError={onError} onFrame={onFrame} /></LogoBoundary></div>}
    </div>
    {canMove && !failed && <div className="rns-logo-controls">
      <button type="button" className="rns-logo-spin" onClick={() => { if (!admitted) admit(); setPaused(false); setSpin(value => value + 1); }}>Rotate logo <span aria-hidden="true">↻</span></button>
      {ready && <button type="button" className="rns-logo-pause" aria-label={paused ? "Play logo motion" : "Pause logo motion"} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Play" : "Pause"}</button>}
    </div>}
  </div>;
}
