import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string;
  role: string | null;
};

/**
 * The signed-in user plus their profile, or null when signed out.
 *
 * Reads are public in v1 (docs/TASKS.md keeps the dashboard viewable when
 * logged out), so callers must handle null rather than assume a session.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    // Fall back to the email local-part so an activity is never attributed to
    // a blank name if the profile row is missing.
    fullName: profile?.full_name || user.email?.split("@")[0] || "Unknown",
    role: profile?.role ?? null,
  };
}

/** Guard for server actions that write. Throws so callers fail closed. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be signed in to do that.");
  return user;
}
