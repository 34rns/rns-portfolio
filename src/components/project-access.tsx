"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Entitlement } from "@/lib/payments/access";

/**
 * Purchase state is fetched after mount so the project page itself stays
 * statically generated. A buyer sees the live URL and the delivery note; the
 * URL and note never appear in the cached HTML.
 */
export function ProjectAccess({
  slug,
  priceLabel,
  isPaid,
}: {
  slug: string;
  priceLabel: string;
  isPaid: boolean;
}) {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(isPaid);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isPaid) return;

    const controller = new AbortController();

    fetch(`/api/entitlement?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not check your access.");
        return (await response.json()) as Entitlement;
      })
      .then((payload) => {
        setEntitlement(payload);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Could not check your access.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [isPaid, slug, reloadKey]);

  if (!isPaid) return null;

  async function buy() {
    setBusy(true);
    setActionError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        setActionError(payload.error ?? "Checkout could not be started.");
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setActionError("Checkout could not be started. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setLoading(true);
    setError(null);
    setReloadKey((value) => value + 1);
  }

  return (
    <section
      aria-labelledby="access-heading"
      className="border-y border-[var(--theme-line)] py-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 id="access-heading" className="mono text-[var(--theme-muted)]">
            {entitlement?.purchased ? "Your access" : "Buy this project"}
          </h2>
          <p className="display mt-2 text-[1.6rem] font-medium">
            {loading
              ? "Checking your access…"
              : entitlement?.purchased
                ? "You own this project"
                : priceLabel}
          </p>
        </div>

        {!loading && !entitlement?.purchased && entitlement?.authenticated ? (
          <button
            type="button"
            onClick={buy}
            disabled={busy}
            className="bg-[var(--theme-text)] px-5 py-3 text-sm text-[var(--theme-background)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Opening checkout…" : `Buy for ${priceLabel}`}
          </button>
        ) : null}

        {!loading && !entitlement?.purchased && !entitlement?.authenticated ? (
          <Link
            href={`/account/signup?next=${encodeURIComponent(`/projects/${slug}`)}`}
            className="bg-[var(--theme-text)] px-5 py-3 text-sm text-[var(--theme-background)] transition-opacity hover:opacity-90"
          >
            Create an account to buy
          </Link>
        ) : null}
      </div>

      {loading ? (
        <p aria-live="polite" className="sr-only">
          Checking purchase status
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-[#B3261E]" role="alert">
          {error}{" "}
          <button type="button" onClick={retry} className="underline">
            Try again
          </button>
        </p>
      ) : null}

      {actionError ? (
        <p className="mt-4 text-sm text-[#B3261E]" role="alert">
          {actionError}
        </p>
      ) : null}

      {entitlement?.purchased ? (
        <div className="mt-5 space-y-4">
          {entitlement.liveUrl ? (
            <a
              href={entitlement.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="nav-link inline-block text-[1rem]"
              data-cursor="view"
            >
              Open the live app
            </a>
          ) : null}

          {entitlement.deliveryNote ? (
            <div className="border-l-2 border-[var(--theme-accent)] pl-4">
              <p className="mono text-[var(--theme-muted)]">Delivery note</p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-[1rem] leading-[1.6]">
                {entitlement.deliveryNote}
              </pre>
            </div>
          ) : null}

          <p className="text-sm text-[var(--theme-muted)]">
            <Link href="/account/purchases" className="underline">
              All your purchases
            </Link>
          </p>
        </div>
      ) : null}

      {!loading && !entitlement?.purchased && entitlement?.authenticated ? (
        <p className="mt-4 text-sm text-[var(--theme-muted)]">
          Payment is handled by the provider. Access appears here as soon as its
          webhook confirms the order.
        </p>
      ) : null}
    </section>
  );
}
