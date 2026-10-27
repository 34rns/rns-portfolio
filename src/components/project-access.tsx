"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Entitlement } from "@/lib/payments/access";
import { PAYMENT_METHODS } from "@/lib/orders/store";

export type PaymentMode = "manual" | "provider" | "mock";

/**
 * The paid-project panel.
 *
 * In manual mode the Buy button is replaced by a request form: the buyer pays
 * however we agreed, and the key arrives by hand. The free download stays
 * visible either way — the app is free, only Pro is sold.
 *
 * Everything here happens after mount, so the project page itself stays
 * statically generated and the buyer-only content never enters its HTML.
 */
export function ProjectAccess({
  slug,
  priceLabel,
  isPaid,
  downloadUrl,
  mode,
}: {
  slug: string;
  priceLabel: string;
  isPaid: boolean;
  downloadUrl: string | null;
  mode: PaymentMode;
}) {
  const router = useRouter();
  // Stamped after mount: reading the clock during render is not allowed, and a
  // timestamp from the server would measure the CDN's age, not the human's.
  const renderedAt = useRef(0);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

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

  async function requestPro(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setActionError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
          method: String(data.get("method") ?? ""),
          website: String(data.get("website") ?? ""),
          renderedAt: renderedAt.current,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };

      if (!response.ok || !payload.token) {
        setActionError(payload.error ?? "The request could not be sent.");
        return;
      }

      router.push(`/order/${payload.token}`);
    } catch {
      setActionError("The request could not be sent. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setEntitlement(null);
    setError(null);
    setReloadKey((value) => value + 1);
  }

  const owned = Boolean(entitlement?.purchased);
  const showRequest = !owned && mode === "manual";
  const showBuy = !owned && mode !== "manual";
  /** Derived rather than stored, so the form is never hidden behind a fetch. */
  const checking = isPaid && entitlement === null && !error;

  return (
    <section
      aria-labelledby="access-heading"
      className="border-y border-[var(--theme-line)] py-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 id="access-heading" className="mono text-[var(--theme-muted)]">
            {owned ? "Your access" : "Pro"}
          </h2>
          <p className="display mt-2 text-[1.6rem] font-medium">
            {owned ? "You own this project" : `Unlock Pro — ${priceLabel}`}
          </p>
        </div>

        {downloadUrl ? (
          <a
            href={downloadUrl}
            className="mono border border-[var(--theme-line)] px-4 py-2 text-sm hover:border-[var(--theme-text)]"
            data-cursor="download"
          >
            Free download ↓
          </a>
        ) : null}
      </div>

      {checking ? (
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

      {owned ? (
        <div className="mt-5 space-y-4">
          {entitlement?.liveUrl ? (
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

          {entitlement?.deliveryNote ? (
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

      {showBuy ? (
        <div className="mt-5">
          {entitlement?.authenticated ? (
            <button
              type="button"
              onClick={buy}
              disabled={busy}
              className="bg-[var(--theme-text)] px-5 py-3 text-sm text-[var(--theme-bg)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Opening checkout…" : `Buy for ${priceLabel}`}
            </button>
          ) : (
            <Link
              href={`/account/signup?next=${encodeURIComponent(`/projects/${slug}`)}`}
              className="bg-[var(--theme-text)] px-5 py-3 text-sm text-[var(--theme-bg)] transition-opacity hover:opacity-90"
            >
              Create an account to buy
            </Link>
          )}
          <p className="mt-3 text-sm text-[var(--theme-muted)]">
            Payment is handled by the provider. Access appears here as soon as its
            webhook confirms the order.
          </p>
        </div>
      ) : null}

      {showRequest ? (
        <div className="mt-6">
          <p className="max-w-[52ch] text-sm leading-[1.6] text-[var(--theme-muted)]">
            Send a request and I&apos;ll reply with payment details (bKash, bank
            transfer or PayPal). Once payment clears you get a license key and a
            private page to track the order.
          </p>

          <form onSubmit={requestPro} className="mt-5 grid max-w-[560px] gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mono text-[var(--theme-muted)]">Name</span>
                <input
                  name="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="mt-1 w-full border border-[var(--theme-line)] bg-transparent px-3 py-2 text-[1rem]"
                />
              </label>

              <label className="block text-sm">
                <span className="mono text-[var(--theme-muted)]">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  className="mt-1 w-full border border-[var(--theme-line)] bg-transparent px-3 py-2 text-[1rem]"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mono text-[var(--theme-muted)]">
                Preferred payment method
              </span>
              <select
                name="method"
                defaultValue={PAYMENT_METHODS[0]}
                className="mt-1 w-full border border-[var(--theme-line)] bg-transparent px-3 py-2 text-[1rem]"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method} className="text-black">
                    {method}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mono text-[var(--theme-muted)]">
                Anything I should know? (optional)
              </span>
              <textarea
                name="message"
                rows={3}
                maxLength={2000}
                className="mt-1 w-full border border-[var(--theme-line)] bg-transparent px-3 py-2 text-[1rem]"
              />
            </label>

            {/* Honeypot: hidden from people, irresistible to form-filling bots. */}
            <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={busy}
                className="bg-[var(--theme-text)] px-5 py-3 text-sm text-[var(--theme-bg)] transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Sending…" : "Request Pro"}
              </button>
              <span className="text-sm text-[var(--theme-muted)]">
                No account needed.
              </span>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
