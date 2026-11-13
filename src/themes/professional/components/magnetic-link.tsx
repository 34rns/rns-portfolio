"use client";

import type { PointerEvent, ReactNode } from "react";
import Link from "next/link";

export function MagneticLink({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--magnet-x", `${((event.clientX - rect.left) / rect.width - 0.5) * 10}px`);
    event.currentTarget.style.setProperty("--magnet-y", `${((event.clientY - rect.top) / rect.height - 0.5) * 8}px`);
  }
  function reset(event: PointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty("--magnet-x", "0px");
    event.currentTarget.style.setProperty("--magnet-y", "0px");
  }
  return <Link href={href} prefetch={false} className="rns-button" target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>{children}</Link>;
}
