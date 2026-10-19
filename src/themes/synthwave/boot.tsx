"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

const BOOT_LINES = [
  "RNS BIOS v2.6 .............. OK",
  "MEMORY 640K ................ OK",
  "NEON_SUITE.SYS ............. LOAD",
  "GRID DRIVER ................ READY",
  "SIGNAL LOCK ................ ONLINE",
];

const SESSION_KEY = "rns-synth-boot";

function subscribeSession() {
  return () => {};
}

function getSeen() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSeen() {
  return false;
}

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReduced() {
  return false;
}

/**
 * A short arcade boot: BIOS lines type themselves in CSS, then PRESS START
 * takes over. The overlay is server-rendered (so no layout shift), skipped on
 * repeat visits in the same session, and hidden entirely for reduced motion.
 * Dismissal marks the theme root `data-booted`, which starts the hero
 * choreography instead of letting it play unseen behind the overlay.
 */
export function SynthBoot() {
  const overlay = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const closing = useRef(false);
  const dismissRef = useRef<(animate: boolean) => void>(() => {});
  const seen = useSyncExternalStore(
    subscribeSession,
    getSeen,
    getServerSeen,
  );
  const reduced = useSyncExternalStore(
    subscribeMotion,
    getReduced,
    getServerReduced,
  );
  const [dismissed, setDismissed] = useState(false);
  const [poweringOff, setPoweringOff] = useState(false);

  const open = !dismissed && !seen && !reduced;

  useEffect(() => {
    if (!open) return;

    const node = overlay.current;
    if (!node) return;

    const root = node.closest<HTMLElement>(".synth-root");

    function dismiss(animate: boolean) {
      if (closing.current) return;
      closing.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Private browsing can refuse storage; the intro still dismisses.
      }
      root?.setAttribute("data-booted", "");

      if (animate) {
        setPoweringOff(true);
        timer.current = window.setTimeout(() => setDismissed(true), 430);
      } else {
        setDismissed(true);
      }
    }

    dismissRef.current = dismiss;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.focus({ preventScroll: true });

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss(true);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        const target = event.target as HTMLElement | null;
        if (target?.closest("button, a")) return;
        event.preventDefault();
        dismiss(true);
        return;
      }

      if (event.key === "Tab") {
        const focusable = Array.from(
          node!.querySelectorAll<HTMLElement>("button, a[href]"),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlay}
      className={`synth-boot${poweringOff ? " is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="RNS boot sequence"
      tabIndex={-1}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismissRef.current(true);
      }}
    >
      <noscript>
        <style>{`.synth-boot{display:none!important}`}</style>
      </noscript>

      <div className="synth-boot-screen">
        <div className="synth-boot-bar">
          <span>RNS SYSTEMS</span>
          <span>CH 03 / 1986</span>
        </div>

        <p className="synth-boot-brand">
          RNS<span>{"//"}</span>NEON
        </p>

        <div className="synth-boot-log" role="status" aria-live="polite">
          {BOOT_LINES.map((line, index) => (
            <p
              key={line}
              className="synth-boot-line"
              style={
                {
                  "--chars": line.length,
                  "--line-delay": `${0.25 + index * 0.32}s`,
                } as CSSProperties
              }
            >
              {line}
            </p>
          ))}
          <span className="synth-boot-caret" aria-hidden="true" />
        </div>

        <div className="synth-boot-start">
          <button
            type="button"
            className="synth-boot-button"
            onClick={() => dismissRef.current(true)}
          >
            Press start
          </button>

          <button
            type="button"
            className="synth-boot-skip"
            onClick={() => dismissRef.current(false)}
          >
            Skip intro
          </button>
        </div>

        <p className="synth-boot-foot">Enter to start / Esc to skip</p>
      </div>
    </div>
  );
}
