"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createActivity } from "@/app/actions/activities";
import {
  ACTION_TYPES,
  EMPTY_FORM_STATE,
  NOTE_MAX_LENGTH,
  TEAM_ROLES,
} from "@/lib/types";
import { titleCase } from "@/lib/format";
import { Field, FormError, SubmitButton, inputClass } from "@/app/components/form";

export function ActivityForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState(createActivity, EMPTY_FORM_STATE);
  const [note, setNote] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fe = state.fieldErrors ?? {};

  // Clear the form once the insert succeeds so the next update starts blank.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setNote("");
    }
  }, [state.ok]);

  const overLimit = note.length > NOTE_MAX_LENGTH;
  const nearLimit = note.length > NOTE_MAX_LENGTH * 0.9;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="project_id" value={projectId} />
      <FormError message={state.error} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Your name" htmlFor="actor_name" required error={fe.actor_name}>
          <input
            id="actor_name"
            name="actor_name"
            className={inputClass}
            placeholder="e.g. James Lim"
          />
        </Field>

        <Field label="Your role" htmlFor="actor_role">
          <select
            id="actor_role"
            name="actor_role"
            defaultValue=""
            className={inputClass}
          >
            <option value="">Select…</option>
            {TEAM_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Update type" htmlFor="action_type" error={fe.action_type}>
          <select
            id="action_type"
            name="action_type"
            defaultValue="comment"
            className={inputClass}
          >
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {titleCase(t)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Note" htmlFor="note" required error={fe.note}>
        <textarea
          id="note"
          name="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputClass}
          placeholder="e.g. Drafting pricing comparison sheet"
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Adding update…">Add update</SubmitButton>
        {nearLimit && (
          <span
            className={`text-xs ${
              overLimit ? "font-medium text-red-600" : "text-amber-700"
            }`}
          >
            {note.length.toLocaleString()} / {NOTE_MAX_LENGTH.toLocaleString()}{" "}
            characters
            {overLimit ? " — too long to save" : ""}
          </span>
        )}
        {state.ok && !state.error && (
          <span className="text-xs font-medium text-emerald-700">
            Update added.
          </span>
        )}
      </div>
    </form>
  );
}
