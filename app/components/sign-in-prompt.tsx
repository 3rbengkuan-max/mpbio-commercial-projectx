import Link from "next/link";

/**
 * Shown in place of a write control when signed out. Reads stay public in v1,
 * so a visitor sees the data and a clear reason they cannot change it — rather
 * than a form that would be rejected by RLS on submit.
 */
export function SignInPrompt({ action }: { action: string }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-6 text-center">
      <p className="text-sm text-neutral-600">
        Sign in to {action}.
      </p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <Link
          href="/login"
          className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
