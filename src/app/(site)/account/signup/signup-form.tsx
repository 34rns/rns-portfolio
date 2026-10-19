"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction, type VisitorFormState } from "../actions";

export function VisitorSignupForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(
    signupAction,
    {} as VisitorFormState,
  );
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label className="mono block text-[var(--theme-muted)]" htmlFor="name">
          Name (optional)
        </label>
        <input
          className="mt-1 w-full border border-[var(--theme-line)] bg-transparent px-3 py-2 text-[1rem] outline-none focus:border-[var(--theme-text)]"
          id="name"
          name="name"
          autoComplete="name"
        />
      </div>

      <div>
        <label className="mono block text-[var(--theme-muted)]" htmlFor="email">
          Email
        </label>
        <input
          className="mt-1 w-full border border-[var(--theme-line)] bg-transparent px-3 py-2 text-[1rem] outline-none focus:border-[var(--theme-text)]"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        {errors.email ? (
          <p className="mt-1 text-sm text-[#B3261E]">{errors.email}</p>
        ) : null}
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
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="mt-1 text-xs text-[var(--theme-muted)]">At least 8 characters.</p>
        {errors.password ? (
          <p className="mt-1 text-sm text-[#B3261E]">{errors.password}</p>
        ) : null}
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
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-sm text-[var(--theme-muted)]">
        Already have one?{" "}
        <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
