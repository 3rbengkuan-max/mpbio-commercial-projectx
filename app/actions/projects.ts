"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import {
  EMPTY_FORM_STATE,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  type FormState,
} from "@/lib/types";

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function nullable(value: string): string | null {
  return value === "" ? null : value;
}

export async function createProject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = str(formData, "title");
  const description = str(formData, "description");
  const signalId = str(formData, "signal_id");
  const ownerName = str(formData, "owner_name");
  const ownerRole = str(formData, "owner_role");
  const priority = str(formData, "priority");
  const dueDate = str(formData, "due_date");
  const actorName = str(formData, "actor_name");

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!signalId) fieldErrors.signal_id = "Link this project to a signal.";
  if (!ownerName) fieldErrors.owner_name = "Assign an owner.";
  if (priority && !PROJECT_PRIORITIES.includes(priority as never))
    fieldErrors.priority = "Unrecognised priority.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();

  // Guard the FK explicitly so a stale dropdown gives a readable message
  // rather than a raw Postgres constraint error.
  const { data: signal } = await supabase
    .from("signals")
    .select("id")
    .eq("id", signalId)
    .maybeSingle();

  if (!signal) {
    return {
      ok: false,
      fieldErrors: { signal_id: "That signal no longer exists." },
    };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title,
      description: nullable(description),
      signal_id: signalId,
      owner_name: ownerName,
      owner_role: nullable(ownerRole),
      status: "active",
      priority: priority || "medium",
      due_date: nullable(dueDate),
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: `Could not create the project: ${error?.message ?? "unknown error"}`,
    };
  }

  await writeAudit(supabase, {
    actorName: nullable(actorName) ?? ownerName,
    action: "project.created",
    targetTable: "projects",
    targetId: data.id,
    detail: {
      after: {
        title,
        signal_id: signalId,
        owner_name: ownerName,
        owner_role: ownerRole || null,
        priority: priority || "medium",
        due_date: dueDate || null,
        status: "active",
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/signals/${signalId}`);
  redirect(`/projects/${data.id}`);
}

/**
 * Change project status. Also writes a status_change activity so the change is
 * visible in the project's own timeline, not just the audit log.
 */
export async function updateProjectStatus(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = str(formData, "id");
  const status = str(formData, "status");
  const actorName = str(formData, "actor_name");
  const outcome = str(formData, "outcome");

  if (!id) return { ok: false, error: "Missing project id." };
  if (!PROJECT_STATUSES.includes(status as never))
    return { ok: false, error: "Unrecognised status." };

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("projects")
    .select("status, owner_name, outcome")
    .eq("id", id)
    .single();

  if (before?.status === status) {
    return { ok: false, error: `Project is already ${status}.` };
  }

  const update: Record<string, unknown> = { status };
  if (outcome) update.outcome = outcome;

  const { error } = await supabase.from("projects").update(update).eq("id", id);

  if (error) {
    return { ok: false, error: `Could not update status: ${error.message}` };
  }

  const actor = nullable(actorName) ?? before?.owner_name ?? null;

  await supabase.from("activities").insert({
    project_id: id,
    actor_name: actor,
    action_type: "status_change",
    note: `Status changed from ${before?.status ?? "unknown"} to ${status}.`,
    status_change_from: before?.status ?? null,
    status_change_to: status,
  });

  await writeAudit(supabase, {
    actorName: actor,
    action: "project.status_changed",
    targetTable: "projects",
    targetId: id,
    detail: {
      before: { status: before?.status ?? null, outcome: before?.outcome ?? null },
      after: { status, outcome: outcome || before?.outcome || null },
    },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { ...EMPTY_FORM_STATE, ok: true };
}

export async function deleteProject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = str(formData, "id");
  const actorName = str(formData, "actor_name");
  if (!id) return { ok: false, error: "Missing project id." };

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  // Activities FK to projects, so clear them first.
  const { error: activityError } = await supabase
    .from("activities")
    .delete()
    .eq("project_id", id);

  if (activityError) {
    return {
      ok: false,
      error: `Could not remove the project's activities: ${activityError.message}`,
    };
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    return { ok: false, error: `Could not delete the project: ${error.message}` };
  }

  await writeAudit(supabase, {
    actorName: nullable(actorName),
    action: "project.deleted",
    targetTable: "projects",
    targetId: id,
    detail: { before: before ?? {} },
  });

  revalidatePath("/");
  revalidatePath("/projects");
  if (before?.signal_id) revalidatePath(`/signals/${before.signal_id}`);
  redirect("/projects");
}
