"use client";

import Link from "next/link";
import { useActionState } from "react";
import { visitorLoginAction, type VisitorFormState } from "../actions";

export function VisitorLoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(
    visitorLoginAction,
    {} as VisitorFormState,
  );

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label className="mono block text-[var(--theme-muted)]" htmlFor="email">
          Email
        </label>
        <input
          className="mt-1 w-full border border-[var(--theme-line)] bg-transparent px-3 py-2 text-[1rem] outline-none focus:border-[var(--theme-text)]"
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label className="mono block text-[var(--theme-muted)]" htmlFor="password">
          Password
        </label>
        <input
          className="mt-1 w-full border border-[var(--theme-line)] bg-transparent px-3 py-2 text-[1rem] outline-none focus:border-[var(--theme-text)]"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-[#B3261E]" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--theme-text)] px-4 py-2.5 text-sm text-[var(--theme-background)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-sm text-[var(--theme-muted)]">
        No account yet?{" "}
        <Link href={`/account/signup?next=${encodeURIComponent(next)}`} className="underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
