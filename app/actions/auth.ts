"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TEAM_ROLES, type FormState } from "@/lib/types";

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = str(formData, "email");
  const password = str(formData, "password");
  const next = str(formData, "next");

  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Enter your email.";
  if (!password) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately generic: don't reveal whether the address has an account.
    return { ok: false, error: "Incorrect email or password." };
  }

  revalidatePath("/", "layout");
  redirect(next && next.startsWith("/") ? next : "/");
}

export async function signUp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = str(formData, "email");
  const password = str(formData, "password");
  const fullName = str(formData, "full_name");
  const role = str(formData, "role");

  const fieldErrors: Record<string, string> = {};
  if (!fullName) fieldErrors.full_name = "Enter your name.";
  if (!email) fieldErrors.email = "Enter your email.";
  if (!password) fieldErrors.password = "Choose a password.";
  else if (password.length < 8)
    fieldErrors.password = "Use at least 8 characters.";
  if (!role) fieldErrors.role = "Select your role.";
  else if (!TEAM_ROLES.includes(role as never))
    fieldErrors.role = "Unrecognised role.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Read by the handle_new_user trigger to populate profiles.
    options: { data: { full_name: fullName, role } },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // When email confirmation is enabled in Supabase, signUp returns a user but
  // no session. Say so rather than bouncing to a page that still looks logged out.
  if (!data.session) {
    return { ok: true, needsEmailConfirmation: true };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
