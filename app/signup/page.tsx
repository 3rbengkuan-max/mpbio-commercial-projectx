import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/ui";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="Create your account"
        description="Join the commercial team workspace."
      />
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <SignupForm />
      </div>
    </div>
  );
}
