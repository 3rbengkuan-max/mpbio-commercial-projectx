"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createProject } from "@/app/actions/projects";
import {
  EMPTY_FORM_STATE,
  PROJECT_PRIORITIES,
  TEAM_ROLES,
  type Signal,
} from "@/lib/types";
import { titleCase } from "@/lib/format";
import { Field, FormError, SubmitButton, inputClass } from "@/app/components/form";

export function ProjectForm({
  signals,
  presetSignalId,
}: {
  signals: Pick<Signal, "id" | "title" | "category">[];
  presetSignalId?: string;
}) {
  const [state, formAction] = useActionState(createProject, EMPTY_FORM_STATE);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state.error} />

      <Field label="Title" htmlFor="title" required error={fe.title}>
        <input
          id="title"
          name="title"
          className={inputClass}
          placeholder="e.g. Counter BioLegend ELISA — competitive response"
        />
      </Field>

      <Field
        label="Linked signal"
        htmlFor="signal_id"
        required
        error={fe.signal_id}
        hint="Every project answers a signal the team has logged."
      >
        <select
          id="signal_id"
          name="signal_id"
          defaultValue={presetSignalId ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            {signals.length === 0
              ? "No signals available — log one first"
              : "Select a signal…"}
          </option>
          {signals.map((s) => (
            <option key={s.id} value={s.id}>
              [{titleCase(s.category)}] {s.title}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        hint="What is the team going to do about this signal?"
      >
        <textarea
          id="description"
          name="description"
          rows={4}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Owner" htmlFor="owner_name" required error={fe.owner_name}>
          <input
            id="owner_name"
            name="owner_name"
            className={inputClass}
            placeholder="e.g. Sarah Tan"
          />
        </Field>

        <Field label="Owner role" htmlFor="owner_role">
          <select
            id="owner_role"
            name="owner_role"
            defaultValue=""
            className={inputClass}
          >
            <option value="">Select a role…</option>
            {TEAM_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Priority" htmlFor="priority" error={fe.priority}>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            className={inputClass}
          >
            {PROJECT_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {titleCase(p)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Due date" htmlFor="due_date">
          <input
            id="due_date"
            name="due_date"
            type="date"
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Created by"
        htmlFor="actor_name"
        hint="Recorded on the audit trail. Defaults to the owner."
      >
        <input
          id="actor_name"
          name="actor_name"
          className={inputClass}
          placeholder="Your name"
        />
      </Field>

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-5">
        <SubmitButton pendingLabel="Creating project…">
          Create project
        </SubmitButton>
        <Link
          href="/projects"
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
