"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded bg-tinta px-4 py-2 font-medium text-papel disabled:opacity-60"
    >
      {pending ? "Ingresando…" : "Ingresar"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(signIn, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="focus-ring rounded border border-tinta/20 bg-white px-3 py-2"
      />

      <label className="text-sm font-medium" htmlFor="password">
        Contraseña
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="focus-ring rounded border border-tinta/20 bg-white px-3 py-2"
      />

      {state?.error ? (
        <p role="alert" className="text-sm text-urgente">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
