import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Activity, Project, Signal } from "@/lib/types";
import { EmptyState, ErrorState, PageHeader, PrimaryLink } from "./components/ui";
import { SignalFilters } from "./components/signal-filters";
import {
  AuditPreview,
  CountCard,
  OpenProjectRow,
  RecentActivity,
  SignalPreviewRow,
  StatusBreakdown,
} from "./components/dashboard";

export const dynamic = "force-dynamic";

/**
 * Sprint 3: the operational dashboard is the homepage — one shared view of
 * everything happening. Every number here is computed from live DB rows.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [signalsRes, projectsRes, activitiesRes, auditRes] = await Promise.all([
    supabase.from("signals").select("*").order("created_at", { ascending: false }),
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select("id, action, actor_name, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  // If the core reads fail, show the error state rather than rendering zeroes
  // that look like real counts.
  if (signalsRes.error || projectsRes.error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <ErrorState
          message={signalsRes.error?.message ?? projectsRes.error?.message}
        />
      </div>
    );
  }

  const allSignals = (signalsRes.data ?? []) as Signal[];
  const projects = (projectsRes.data ?? []) as Project[];
  const activities = (activitiesRes.data ?? []) as Activity[];

  // Filters apply to the signal preview only, so the count cards stay a true
  // picture of the whole workspace.
  const filteredSignals = allSignals.filter((s) => {
    if (params.category && s.category !== params.category) return false;
    if (params.type && s.signal_type !== params.type) return false;
    return true;
  });

  const openSignals = allSignals.filter((s) => s.status !== "archived");
  const activeProjects = projects.filter((p) => p.status === "active");

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activitiesThisWeek = activities.filter(
    (a) => new Date(a.created_at).getTime() >= weekAgo,
  );

  const threats = allSignals.filter((s) => s.signal_type === "threat");

  const projectTitles = new Map(projects.map((p) => [p.id, p.title]));

  const isEmpty =
    allSignals.length === 0 && projects.length === 0 && activities.length === 0;

  const isFiltered = Boolean(params.category || params.type);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial intelligence dashboard"
        description="Shared view of every signal, project, and update across the team."
        action={<PrimaryLink href="/signals/new">Log signal</PrimaryLink>}
      />

      {isEmpty ? (
        <EmptyState
          title="Nothing logged yet."
          description="Start by capturing a market signal — a competitor move, customer news, or a trend."
          actionHref="/signals/new"
          actionLabel="Log the first signal"
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CountCard
              label="Open signals"
              value={openSignals.length}
              sublabel={`${threats.length} flagged as threats`}
              href="/signals"
            />
            <CountCard
              label="Active projects"
              value={activeProjects.length}
              sublabel={`${projects.length} total`}
              href="/projects?status=active"
            />
            <CountCard
              label="Updates this week"
              value={activitiesThisWeek.length}
              sublabel={`${activities.length} all time`}
              href="/projects"
            />
            <CountCard
              label="Overdue"
              value={
                projects.filter(
                  (p) =>
                    p.due_date &&
                    p.status === "active" &&
                    new Date(p.due_date) < new Date(new Date().toDateString()),
                ).length
              }
              sublabel="Active projects past due"
              href="/projects?status=active"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Latest signals
                  </h2>
                  <Link
                    href="/signals"
                    className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
                  >
                    View all →
                  </Link>
                </div>

                <div className="mt-3">
                  <SignalFilters />
                </div>

                {filteredSignals.length === 0 ? (
                  <p className="mt-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-8 text-center text-sm text-neutral-500">
                    {isFiltered
                      ? "No signals match these filters."
                      : "No signals logged yet. Be the first to add one."}
                  </p>
                ) : (
                  <div className="mt-1">
                    {filteredSignals.slice(0, 5).map((signal) => (
                      <SignalPreviewRow key={signal.id} signal={signal} />
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Open projects
                  </h2>
                  <Link
                    href="/projects"
                    className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
                  >
                    View all →
                  </Link>
                </div>

                {activeProjects.length === 0 ? (
                  <p className="mt-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-8 text-center text-sm text-neutral-500">
                    No active projects. Create one from a signal.
                  </p>
                ) : (
                  <div className="mt-1">
                    {activeProjects.slice(0, 5).map((project) => (
                      <OpenProjectRow key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <StatusBreakdown projects={projects} />
              <RecentActivity
                activities={activities.slice(0, 10)}
                projectTitles={projectTitles}
              />
              <AuditPreview rows={auditRes.data ?? []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
