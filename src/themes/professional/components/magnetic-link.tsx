"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

export function MagneticLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 18 });
  const springY = useSpring(y, { stiffness: 240, damping: 18 });

  function onMove(event: PointerEvent<HTMLElement>) {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 10);
    y.set(((event.clientY - rect.top) / rect.height - 0.5) * 8);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  const className = "inline-flex items-center border-b border-current pb-1 text-[1.1rem]";

  if (external) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        style={{ x: springX, y: springY }}
        onPointerMove={onMove}
        onPointerLeave={reset}
        data-cursor="view"
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.div
      className="inline-block"
      style={{ x: springX, y: springY }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}
