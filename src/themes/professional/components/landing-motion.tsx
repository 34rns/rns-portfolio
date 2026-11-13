"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Progressive navigation crossfade, owned and cleaned up by the landing only. */
export function LandingMotion() {
  const router = useRouter();

  useEffect(() => {
    const root = document.querySelector(".rns-landing");
    if (!root) return;
    let settleNavigation: (() => void) | undefined;

    function navigate(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest?.("a");
      if (!link || link.target || link.hasAttribute("download")) return;
      const destination = new URL(link.href, location.href);
      // Keep the landing's shared skip link in sync with Next's route history.
      if (link.classList.contains("skip-link") && destination.origin === location.origin && destination.pathname === location.pathname) {
        event.preventDefault();
        router.push(destination.pathname + destination.search + destination.hash);
        document.getElementById(destination.hash.slice(1))?.focus();
        return;
      }
      if (!root?.contains(link) || !document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (destination.origin !== location.origin || destination.pathname === location.pathname) return;

      event.preventDefault();
      settleNavigation?.();
      const transition = document.startViewTransition(() => new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => { if (!root?.isConnected) finish(); });
        const timeout = window.setTimeout(finish, 2500);
        function finish() {
          observer.disconnect();
          window.clearTimeout(timeout);
          settleNavigation = undefined;
          resolve();
        }
        settleNavigation = finish;
        observer.observe(document.body, { childList: true, subtree: true });
        router.push(destination.pathname + destination.search + destination.hash);
      }));
      // A browser can skip a transition when the tab is hidden or another starts.
      void transition.finished.catch(() => {});
    }

    document.addEventListener("click", navigate, true);
    return () => {
      document.removeEventListener("click", navigate, true);
      settleNavigation?.();
    };
  }, [router]);

  return null;
}
