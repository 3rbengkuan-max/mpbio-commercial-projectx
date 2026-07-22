import { createClient } from "@/lib/supabase/server";
import type { Signal } from "@/lib/types";
import Link from "next/link";
import { EmptyState, ErrorState, PageHeader, PrimaryLink } from "../components/ui";
import { SignalCard } from "../components/signal-card";
import { SignalFilters } from "../components/signal-filters";

export const dynamic = "force-dynamic";

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string; origin?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("signals")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.category) query = query.eq("category", params.category);
  if (params.type) query = query.eq("signal_type", params.type);
  if (params.origin) query = query.eq("origin", params.origin);

  const { data, error } = await query;
  const signals = (data ?? []) as Signal[];

  // Count linked projects per signal so cards can show the link.
  const { data: projectRows } = await supabase
    .from("projects")
    .select("signal_id");

  const projectCounts = new Map<string, number>();
  for (const row of projectRows ?? []) {
    if (row.signal_id) {
      projectCounts.set(row.signal_id, (projectCounts.get(row.signal_id) ?? 0) + 1);
    }
  }

  const isFiltered = Boolean(params.category || params.type || params.origin);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Signal feed"
        description="Market events captured by the commercial team — newest first."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/signals/research"
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
            >
              ⌕ Research signals
            </Link>
            <PrimaryLink href="/signals/new">Log signal</PrimaryLink>
          </div>
        }
      />

      <SignalFilters />

      {error ? (
        <ErrorState message={error.message} />
      ) : signals.length === 0 ? (
        isFiltered ? (
          <EmptyState
            title="No signals match these filters."
            description="Try clearing the category or type filter."
            actionHref="/signals"
            actionLabel="Clear filters"
          />
        ) : (
          <EmptyState
            title="No signals logged yet. Be the first to add one."
            description="Capture a competitor move, customer news, or market trend."
            actionHref="/signals/new"
            actionLabel="Log signal"
          />
        )
      ) : (
        <>
          <p className="text-xs text-neutral-500">
            {signals.length} signal{signals.length === 1 ? "" : "s"}
            {isFiltered ? " matching filters" : ""}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {signals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                projectCount={projectCounts.get(signal.id) ?? 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
