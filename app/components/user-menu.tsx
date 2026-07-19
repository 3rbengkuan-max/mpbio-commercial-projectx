import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";

export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      <div className="text-right leading-tight">
        <p className="text-sm font-medium text-neutral-900">{user.fullName}</p>
        {user.role && (
          <p className="text-xs text-neutral-500">{user.role}</p>
        )}
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
