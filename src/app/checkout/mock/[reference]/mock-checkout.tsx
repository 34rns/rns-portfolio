"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Outcome = "success" | "failed";

export function MockCheckout({
  slug,
  successBody,
  successSignature,
  failedBody,
  failedSignature,
}: {
  slug: string;
  successBody: string;
  successSignature: string;
  failedBody: string;
  failedSignature: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function simulate(outcome: Outcome) {
    setBusy(outcome);
    setError(null);

    try {
      const response = await fetch("/api/webhooks/payments/mock", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-signature": outcome === "success" ? successSignature : failedSignature,
        },
        body: outcome === "success" ? successBody : failedBody,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? `Webhook rejected (${response.status}).`);
      }

      router.push(
        `/projects/${slug}?payment=${outcome === "success" ? "paid" : "failed"}`,
      );
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
      setBusy(null);
    }
  }

  return (
    <div className="mt-8 space-y-3">
      <button
        type="button"
        onClick={() => simulate("success")}
        disabled={busy !== null}
        className="w-full bg-[#14171A] px-5 py-3 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy === "success" ? "Recording payment…" : "Simulate payment success"}
      </button>
      <button
        type="button"
        onClick={() => simulate("failed")}
        disabled={busy !== null}
        className="w-full border border-[#C9C9C2] px-5 py-3 text-sm transition-colors hover:bg-[#EAEAE4] disabled:opacity-60"
      >
        {busy === "failed" ? "Recording failure…" : "Simulate payment failed"}
      </button>

      {error ? (
        <p className="text-sm text-[#B3261E]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
