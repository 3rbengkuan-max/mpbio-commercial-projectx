"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { researchSignals as runResearch } from "@/lib/research";
import {
  EMPTY_RESEARCH_STATE,
  SIGNAL_CATEGORIES,
  SIGNAL_TYPES,
  type FormState,
  type ResearchDraft,
  type ResearchState,
} from "@/lib/types";

/**
 * Draft candidate signals from web research. Returns them for review — it does
 * NOT save anything (docs/AGENTIC_LAYER.md: human confirms before insert).
 */
export async function draftResearchSignals(
  _prev: ResearchState,
  _formData: FormData,
): Promise<ResearchState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to run research." };
  }

  try {
    const { drafts, searchCount } = await runResearch();
    if (drafts.length === 0) {
      return {
        ok: false,
        error:
          "Research ran but returned no usable signals. Try again in a moment.",
      };
    }
    return { ...EMPTY_RESEARCH_STATE, ok: true, drafts, searchCount };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Research failed.",
    };
  }
}

function nullable(value: string | null): string | null {
  return value && value.trim() !== "" ? value : null;
}

/**
 * Import the drafts the user approved. Inserts under the signed-in user's
 * identity (so RLS accepts them) with origin = 'research', one audit row each.
 */
export async function importResearchSignals(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to import signals." };
  }

  const payload = formData.get("drafts");
  if (typeof payload !== "string" || payload.trim() === "") {
    return { ok: false, error: "Select at least one signal to import." };
  }

  let drafts: ResearchDraft[];
  try {
    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed)) throw new Error("bad shape");
    drafts = parsed as ResearchDraft[];
  } catch {
    return { ok: false, error: "Could not read the selected signals." };
  }

  // Re-validate server-side — never trust the shape that came back from the client.
  const clean = drafts.filter(
    (d) =>
      d &&
      typeof d.title === "string" &&
      d.title.trim() !== "" &&
      SIGNAL_CATEGORIES.includes(d.category as never) &&
      SIGNAL_TYPES.includes(d.signal_type as never),
  );

  if (clean.length === 0) {
    return { ok: false, error: "Select at least one valid signal to import." };
  }

  const supabase = await createClient();

  const rows = clean.map((d) => ({
    user_id: user.id,
    title: d.title.slice(0, 300),
    category: d.category,
    signal_type: d.signal_type,
    source_name: nullable(d.source_name),
    source_url: nullable(d.source_url),
    signal_date: nullable(d.signal_date),
    summary: nullable(d.summary),
    status: "new",
    origin: "research",
  }));

  const { data, error } = await supabase
    .from("signals")
    .insert(rows)
    .select("id, title");

  if (error || !data) {
    return {
      ok: false,
      error: `Could not import the signals: ${error?.message ?? "unknown error"}`,
    };
  }

  for (const row of data) {
    await writeAudit(supabase, {
      userId: user.id,
      actorName: user.fullName,
      action: "signal.created",
      targetTable: "signals",
      targetId: row.id,
      detail: { after: { title: row.title, origin: "research" }, via: "research" },
    });
  }

  revalidatePath("/");
  revalidatePath("/signals");
  redirect("/signals?origin=research");
}
