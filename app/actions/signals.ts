"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import {
  EMPTY_FORM_STATE,
  SIGNAL_CATEGORIES,
  SIGNAL_TYPES,
  SIGNAL_STATUSES,
  type FormState,
} from "@/lib/types";

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Empty string → null, so optional columns stay NULL rather than "". */
function nullable(value: string): string | null {
  return value === "" ? null : value;
}

export async function createSignal(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = str(formData, "title");
  const category = str(formData, "category");
  const signalType = str(formData, "signal_type");
  const sourceUrl = str(formData, "source_url");
  const sourceName = str(formData, "source_name");
  const signalDate = str(formData, "signal_date");
  const summary = str(formData, "summary");
  const actorName = str(formData, "actor_name");

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!category) fieldErrors.category = "Pick a category.";
  else if (!SIGNAL_CATEGORIES.includes(category as never))
    fieldErrors.category = "Unrecognised category.";
  if (!signalType) fieldErrors.signal_type = "Pick opportunity or threat.";
  else if (!SIGNAL_TYPES.includes(signalType as never))
    fieldErrors.signal_type = "Unrecognised signal type.";
  if (sourceUrl && !/^https?:\/\/\S+$/i.test(sourceUrl))
    fieldErrors.source_url = "Enter a full URL starting with http:// or https://";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("signals")
    .insert({
      title,
      source_url: nullable(sourceUrl),
      source_name: nullable(sourceName),
      signal_date: nullable(signalDate),
      category,
      signal_type: signalType,
      summary: nullable(summary),
      status: "new",
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: `Could not save the signal: ${error?.message ?? "unknown error"}`,
    };
  }

  await writeAudit(supabase, {
    actorName: nullable(actorName),
    action: "signal.created",
    targetTable: "signals",
    targetId: data.id,
    detail: {
      after: {
        title,
        category,
        signal_type: signalType,
        source_name: sourceName || null,
        source_url: sourceUrl || null,
        signal_date: signalDate || null,
        summary: summary || null,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/signals");
  // docs/TASKS.md Sprint 1: land back on the feed so the new signal is visible at top.
  redirect("/signals");
}

export async function updateSignalStatus(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = str(formData, "id");
  const status = str(formData, "status");
  const actorName = str(formData, "actor_name");

  if (!id) return { ok: false, error: "Missing signal id." };
  if (!SIGNAL_STATUSES.includes(status as never))
    return { ok: false, error: "Unrecognised status." };

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("signals")
    .select("status")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("signals")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { ok: false, error: `Could not update status: ${error.message}` };
  }

  await writeAudit(supabase, {
    actorName: nullable(actorName),
    action: "signal.status_changed",
    targetTable: "signals",
    targetId: id,
    detail: { before: { status: before?.status ?? null }, after: { status } },
  });

  revalidatePath("/");
  revalidatePath("/signals");
  revalidatePath(`/signals/${id}`);
  return { ...EMPTY_FORM_STATE, ok: true };
}

export async function deleteSignal(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = str(formData, "id");
  const actorName = str(formData, "actor_name");
  if (!id) return { ok: false, error: "Missing signal id." };

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("signals")
    .select("*")
    .eq("id", id)
    .single();

  // Projects reference signals via FK, so refuse rather than cascade —
  // docs/AGENTIC_LAYER.md classes deletion as a human-only, critical action.
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("signal_id", id);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `This signal has ${count} linked project${
        count === 1 ? "" : "s"
      }. Delete or relink those first.`,
    };
  }

  const { error } = await supabase.from("signals").delete().eq("id", id);
  if (error) {
    return { ok: false, error: `Could not delete the signal: ${error.message}` };
  }

  await writeAudit(supabase, {
    actorName: nullable(actorName),
    action: "signal.deleted",
    targetTable: "signals",
    targetId: id,
    detail: { before: before ?? {} },
  });

  revalidatePath("/");
  revalidatePath("/signals");
  redirect("/signals");
}
