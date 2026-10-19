"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {} as FormState);

  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <label className="admin-label" htmlFor="email">
          Email
        </label>
        <input
          className="admin-field"
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>
      <div>
        <label className="admin-label" htmlFor="password">
          Password
        </label>
        <input
          className="admin-field"
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
        className="w-full bg-[#14171A] px-4 py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
