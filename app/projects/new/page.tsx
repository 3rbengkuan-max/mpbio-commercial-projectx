import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/app/components/ui";
import { ProjectForm } from "./project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ signal?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("signals")
    .select("id, title, category")
    .order("created_at", { ascending: false });

  const signals = data ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Create project"
        description="Turn a signal into an owned, tracked response."
      />

      {signals.length === 0 ? (
        <EmptyState
          title="No signals to link yet."
          description="A project must respond to a signal, so log one first."
          actionHref="/signals/new"
          actionLabel="Log signal"
        />
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <ProjectForm signals={signals} presetSignalId={params.signal} />
        </div>
      )}
    </div>
  );
}
