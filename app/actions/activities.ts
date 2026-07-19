"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import {
  ACTION_TYPES,
  EMPTY_FORM_STATE,
  NOTE_MAX_LENGTH,
  type FormState,
} from "@/lib/types";

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function nullable(value: string): string | null {
  return value === "" ? null : value;
}

export async function createActivity(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const projectId = str(formData, "project_id");
  const actorName = str(formData, "actor_name");
  const actorRole = str(formData, "actor_role");
  const actionType = str(formData, "action_type");
  const note = str(formData, "note");

  const fieldErrors: Record<string, string> = {};
  if (!projectId) return { ok: false, error: "Missing project id." };
  if (!actorName) fieldErrors.actor_name = "Who is logging this update?";
  if (!note) fieldErrors.note = "Add a note describing the update.";
  else if (note.length > NOTE_MAX_LENGTH)
    fieldErrors.note = `Note is ${note.length} characters — the limit is ${NOTE_MAX_LENGTH}.`;
  if (actionType && !ACTION_TYPES.includes(actionType as never))
    fieldErrors.action_type = "Unrecognised action type.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();

  // Carry the project's signal onto the activity so a signal's timeline can be
  // assembled without a join through projects.
  const { data: project } = await supabase
    .from("projects")
    .select("id, signal_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) {
    return { ok: false, error: "That project no longer exists." };
  }

  const { data, error } = await supabase
    .from("activities")
    .insert({
      project_id: projectId,
      signal_id: project.signal_id,
      actor_name: actorName,
      actor_role: nullable(actorRole),
      action_type: actionType || "comment",
      note,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: `Could not save the update: ${error?.message ?? "unknown error"}`,
    };
  }

  await writeAudit(supabase, {
    actorName,
    action: "activity.created",
    targetTable: "activities",
    targetId: data.id,
    detail: {
      after: {
        project_id: projectId,
        actor_name: actorName,
        actor_role: actorRole || null,
        action_type: actionType || "comment",
        note,
      },
    },
  });

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  return { ...EMPTY_FORM_STATE, ok: true };
}

export async function deleteActivity(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = str(formData, "id");
  const projectId = str(formData, "project_id");
  const actorName = str(formData, "actor_name");
  if (!id) return { ok: false, error: "Missing activity id." };

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) {
    return { ok: false, error: `Could not delete the update: ${error.message}` };
  }

  await writeAudit(supabase, {
    actorName: nullable(actorName),
    action: "activity.deleted",
    targetTable: "activities",
    targetId: id,
    detail: { before: before ?? {} },
  });

  revalidatePath("/");
  if (projectId) revalidatePath(`/projects/${projectId}`);
  return { ...EMPTY_FORM_STATE, ok: true };
}
