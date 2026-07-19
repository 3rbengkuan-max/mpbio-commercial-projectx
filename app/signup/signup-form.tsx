"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { EMPTY_FORM_STATE, TEAM_ROLES } from "@/lib/types";
import { Field, FormError, SubmitButton, inputClass } from "@/app/components/form";

export function SignupForm() {
  const [state, formAction] = useActionState(signUp, EMPTY_FORM_STATE);
  const fe = state.fieldErrors ?? {};

  if (state.needsEmailConfirmation) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <p className="font-medium">Check your email.</p>
        <p className="mt-1">
          Your account was created, but this Supabase project requires email
          confirmation. Click the link we sent, then sign in.
        </p>
        <Link
          href="/login"
          className="mt-3 inline-block font-medium underline underline-offset-2"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state.error} />

      <Field label="Full name" htmlFor="full_name" required error={fe.full_name}>
        <input
          id="full_name"
          name="full_name"
          autoComplete="name"
          className={inputClass}
          placeholder="e.g. Sarah Tan"
        />
      </Field>

      <Field
        label="Role"
        htmlFor="role"
        required
        error={fe.role}
        hint="Sales Managers can edit any project, not just their own."
      >
        <select id="role" name="role" defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select your role…
          </option>
          {TEAM_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Email" htmlFor="email" required error={fe.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputClass}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        required
        error={fe.password}
        hint="At least 8 characters."
      >
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <SubmitButton pendingLabel="Creating account…">
        Create account
      </SubmitButton>

      <p className="text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
