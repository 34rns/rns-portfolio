"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

const query = "(pointer: fine)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

export function Cursor() {
  const reduce = useReducedMotion();
  const finePointer = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.35 });
  const enabled = finePointer && !reduce;

  useEffect(() => {
    if (!enabled) return;

    function onMove(event: PointerEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target as HTMLElement | null;
      setHovering(Boolean(target?.closest("[data-cursor='view']")));
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="cursor-dot"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: hovering ? 56 : 14,
        height: hovering ? 56 : 14,
        opacity: hovering ? 0.92 : 0.8,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    />
  );
}
