"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createSignal } from "@/app/actions/signals";
import { EMPTY_FORM_STATE, SIGNAL_CATEGORIES, SIGNAL_TYPES } from "@/lib/types";
import { titleCase } from "@/lib/format";
import { Field, FormError, SubmitButton, inputClass } from "@/app/components/form";

export function SignalForm() {
  const [state, formAction] = useActionState(createSignal, EMPTY_FORM_STATE);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state.error} />

      <Field label="Title" htmlFor="title" required error={fe.title}>
        <input
          id="title"
          name="title"
          className={inputClass}
          placeholder="e.g. BioLegend launches competing ELISA kit"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" required error={fe.category}>
          <select id="category" name="category" defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select a category…
            </option>
            {SIGNAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleCase(c)}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Signal type"
          htmlFor="signal_type"
          required
          error={fe.signal_type}
        >
          <select
            id="signal_type"
            name="signal_type"
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              Select a type…
            </option>
            {SIGNAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {titleCase(t)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Source name"
          htmlFor="source_name"
          hint="Publication or origin, e.g. Reuters"
        >
          <input id="source_name" name="source_name" className={inputClass} />
        </Field>

        <Field label="Signal date" htmlFor="signal_date" hint="When it happened">
          <input
            id="signal_date"
            name="signal_date"
            type="date"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Source URL" htmlFor="source_url" error={fe.source_url}>
        <input
          id="source_url"
          name="source_url"
          type="url"
          className={inputClass}
          placeholder="https://…"
        />
      </Field>

      <Field
        label="Summary"
        htmlFor="summary"
        hint="What happened and why it matters to MPbio."
      >
        <textarea id="summary" name="summary" rows={5} className={inputClass} />
      </Field>

      <Field
        label="Logged by"
        htmlFor="actor_name"
        hint="Recorded on the audit trail."
      >
        <input
          id="actor_name"
          name="actor_name"
          className={inputClass}
          placeholder="Your name"
        />
      </Field>

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-5">
        <SubmitButton pendingLabel="Logging signal…">Log signal</SubmitButton>
        <Link
          href="/signals"
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
