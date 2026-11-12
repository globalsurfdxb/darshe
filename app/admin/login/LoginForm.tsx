"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password" className="field-label">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "login-error" : undefined}
        className="field-input"
      />
      {state.error && (
        <p id="login-error" role="alert" className="field-error">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-6 w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
