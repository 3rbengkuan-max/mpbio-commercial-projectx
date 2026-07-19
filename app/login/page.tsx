import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/ui";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  if (await getCurrentUser()) redirect(next ?? "/");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="Sign in"
        description="Signing in attributes your signals, projects, and updates to you."
      />
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <LoginForm next={next} />
      </div>
      <p className="text-xs text-neutral-500">
        You can browse the dashboard and feed without signing in — an account is
        only needed to add or change data.
      </p>
    </div>
  );
}
