"use client";

import { useActionState, useState } from "react";
import { deleteProject, updateProjectStatus } from "@/app/actions/projects";
import { EMPTY_FORM_STATE, PROJECT_STATUSES } from "@/lib/types";
import { titleCase } from "@/lib/format";
import { FormError, SubmitButton, inputClass } from "@/app/components/form";

export function ProjectControls({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string | null;
}) {
  const [statusState, statusAction] = useActionState(
    updateProjectStatus,
    EMPTY_FORM_STATE,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteProject,
    EMPTY_FORM_STATE,
  );
  const [status, setStatus] = useState(currentStatus ?? "active");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // docs/AGENTIC_LAYER.md marks "dropped" as irreversible, so ask before it.
  const needsConfirm = status === "dropped" && currentStatus !== "dropped";

  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Manage project</h3>

      <form action={statusAction} className="space-y-3">
        <input type="hidden" name="id" value={projectId} />
        <FormError message={statusState.error} />

        <div>
          <label
            htmlFor="status"
            className="block text-xs font-medium text-neutral-600"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`mt-1 ${inputClass}`}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </div>

        {(status === "completed" || status === "dropped") && (
          <div>
            <label
              htmlFor="outcome"
              className="block text-xs font-medium text-neutral-600"
            >
              Outcome
            </label>
            <textarea
              id="outcome"
              name="outcome"
              rows={2}
              className={`mt-1 ${inputClass}`}
              placeholder="How did it end?"
            />
          </div>
        )}

        {needsConfirm && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Dropping a project is irreversible. It stays visible but is closed
            for good.
          </p>
        )}

        <SubmitButton pendingLabel="Updating…">Update status</SubmitButton>

        {statusState.ok && !statusState.error && (
          <p className="text-xs font-medium text-emerald-700">Status updated.</p>
        )}
      </form>

      <div className="border-t border-neutral-200 pt-4">
        <FormError message={deleteState.error} />
        {confirmingDelete ? (
          <form action={deleteAction} className="space-y-2">
            <input type="hidden" name="id" value={projectId} />
            <p className="text-xs text-neutral-600">
              Delete this project and all its updates? This cannot be undone.
            </p>
            <div className="flex items-center gap-2">
              <SubmitButton pendingLabel="Deleting…">
                Yes, delete it
              </SubmitButton>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-xs font-medium text-red-600 hover:text-red-800"
          >
            Delete project
          </button>
        )}
      </div>
    </div>
  );
}
