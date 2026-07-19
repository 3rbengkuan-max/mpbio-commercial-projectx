"use client";

import { useActionState, useState } from "react";
import { deleteSignal, updateSignalStatus } from "@/app/actions/signals";
import { EMPTY_FORM_STATE, SIGNAL_STATUSES } from "@/lib/types";
import { titleCase } from "@/lib/format";
import { FormError, SubmitButton, inputClass } from "@/app/components/form";

export function SignalControls({
  signalId,
  currentStatus,
  linkedProjectCount,
}: {
  signalId: string;
  currentStatus: string | null;
  linkedProjectCount: number;
}) {
  const [statusState, statusAction] = useActionState(
    updateSignalStatus,
    EMPTY_FORM_STATE,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteSignal,
    EMPTY_FORM_STATE,
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Manage signal</h3>

      <form action={statusAction} className="space-y-3">
        <input type="hidden" name="id" value={signalId} />
        <FormError message={statusState.error} />

        <div>
          <label
            htmlFor="signal_status"
            className="block text-xs font-medium text-neutral-600"
          >
            Status
          </label>
          <select
            id="signal_status"
            name="status"
            defaultValue={currentStatus ?? "new"}
            className={`mt-1 ${inputClass}`}
          >
            {SIGNAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="signal_status_actor"
            className="block text-xs font-medium text-neutral-600"
          >
            Your name
          </label>
          <input
            id="signal_status_actor"
            name="actor_name"
            className={`mt-1 ${inputClass}`}
            placeholder="For the audit trail"
          />
        </div>

        <SubmitButton pendingLabel="Updating…">Update status</SubmitButton>

        {statusState.ok && !statusState.error && (
          <p className="text-xs font-medium text-emerald-700">Status updated.</p>
        )}
      </form>

      <div className="border-t border-neutral-200 pt-4">
        <FormError message={deleteState.error} />
        {linkedProjectCount > 0 ? (
          <p className="text-xs text-neutral-500">
            This signal has {linkedProjectCount} linked project
            {linkedProjectCount === 1 ? "" : "s"} and cannot be deleted.
          </p>
        ) : confirmingDelete ? (
          <form action={deleteAction} className="space-y-2">
            <input type="hidden" name="id" value={signalId} />
            <p className="text-xs text-neutral-600">
              Delete this signal? This cannot be undone.
            </p>
            <input
              name="actor_name"
              className={inputClass}
              placeholder="Your name"
            />
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
            Delete signal
          </button>
        )}
      </div>
    </div>
  );
}
