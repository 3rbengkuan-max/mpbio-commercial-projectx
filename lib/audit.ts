import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Append an immutable audit row. Per docs/SECURITY.md every create/update/delete
 * writes one of these server-side, so it is never skippable from the client.
 *
 * The insert is deliberately non-throwing: an audit failure must not roll back or
 * mask an otherwise successful user action. Failures are logged for the server
 * operator instead.
 */
export async function writeAudit(
  supabase: SupabaseClient,
  entry: {
    /** Required: the audit_logs insert policy checks auth.uid() = user_id. */
    userId: string;
    actorName: string | null;
    action: string;
    targetTable: string;
    targetId: string;
    detail: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    user_id: entry.userId,
    actor_name: entry.actorName,
    action: entry.action,
    target_table: entry.targetTable,
    target_id: entry.targetId,
    detail: entry.detail,
  });

  if (error) {
    console.error(
      `audit_logs insert failed for ${entry.action} on ${entry.targetTable}:${entry.targetId}`,
      error.message,
    );
  }
}
