"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { EMPTY_FORM_STATE } from "@/lib/types";
import { Field, FormError, SubmitButton, inputClass } from "@/app/components/form";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signIn, EMPTY_FORM_STATE);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <FormError message={state.error} />

      <Field label="Email" htmlFor="email" required error={fe.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputClass}
        />
      </Field>

      <Field label="Password" htmlFor="password" required error={fe.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>

      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>

      <p className="text-sm text-neutral-500">
        No account yet?{" "}
        <Link
          href="/signup"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
