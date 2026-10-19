"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

const HANDSHAKE_LINES = [
  "CARRIER ACQUIRED ............ 88.9 MHz",
  "CIPHER ..................... AES-256",
  "OPTIC FEED ................. NODE 09",
  "AUTHORITY ................... FIELD OPS",
];

const SESSION_KEY = "rns-cyber-handshake";

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
 * A short uplink handshake instead of a full boot: one card, a meter that
 * fills once, four log lines, then ESTABLISH FEED. Skipped on repeat visits in
 * the same session and hidden entirely for reduced motion, where the page is
 * simply ready. Dismissal marks the theme root `data-booted`, which is what
 * starts the hero choreography.
 */
export function CyberBoot() {
  const overlay = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const closing = useRef(false);
  const dismissRef = useRef<(animate: boolean) => void>(() => {});
  const seen = useSyncExternalStore(subscribeSession, getSeen, getServerSeen);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    getReduced,
    getServerReduced,
  );
  const [dismissed, setDismissed] = useState(false);
  const [closingOut, setClosingOut] = useState(false);

  const open = !dismissed && !seen && !reduced;

  useEffect(() => {
    if (!open) return;
    const node = overlay.current;
    if (!node) return;

    const root = node.closest<HTMLElement>(".cyber-root");

    function dismiss(animate: boolean) {
      if (closing.current) return;
      closing.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Storage can be refused; the handshake still closes.
      }
      root?.setAttribute("data-booted", "");

      if (animate) {
        setClosingOut(true);
        timer.current = window.setTimeout(() => setDismissed(true), 320);
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
        const lastNode = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          lastNode.focus();
        } else if (!event.shiftKey && document.activeElement === lastNode) {
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
      className={`cyber-boot${closingOut ? " is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Uplink handshake"
      tabIndex={-1}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismissRef.current(true);
      }}
    >
      <noscript>
        <style>{`.cyber-boot{display:none!important}`}</style>
      </noscript>

      <div className="cyber-boot-card">
        <div className="cyber-boot-top">
          <span>FIELD OPS // UPLINK</span>
          <span>NODE 09</span>
        </div>

        <p className="cyber-boot-brand">
          RNS<span>{"//"}</span>INTERCEPT
        </p>

        <div className="cyber-boot-meter" aria-hidden="true">
          <span />
        </div>

        <div className="cyber-boot-log" role="status" aria-live="polite">
          {HANDSHAKE_LINES.map((line, index) => (
            <p
              key={line}
              className="cyber-boot-line"
              style={
                {
                  "--line-delay": `${0.18 + index * 0.22}s`,
                } as CSSProperties
              }
            >
              {line}
            </p>
          ))}
        </div>

        <div className="cyber-boot-actions">
          <button
            type="button"
            className="cyber-boot-accept"
            onClick={() => dismissRef.current(true)}
          >
            Establish feed
          </button>
          <button
            type="button"
            className="cyber-boot-skip"
            onClick={() => dismissRef.current(false)}
          >
            Skip
          </button>
        </div>

        <p className="cyber-boot-foot">ENTER to connect / ESC to skip</p>
      </div>
    </div>
  );
}
