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
        description="This workspace is private to the MPbio commercial team."
      />
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <LoginForm next={next} />
      </div>
      <p className="text-xs text-neutral-500">
        Signals, projects, and activity are visible to signed-in team members
        only, and every action is recorded against your name.
      </p>
    </div>
  );
}
