import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { EmptyState, ErrorState, PageHeader, PrimaryLink } from "../components/ui";
import { ProjectCard } from "../components/project-card";
import { ProjectFilters } from "../components/project-filters";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; owner?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.owner) query = query.eq("owner_name", params.owner);

  const { data, error } = await query;
  const projects = (data ?? []) as Project[];

  // Owner list for the filter dropdown comes from all projects, not the
  // filtered set, so the current selection never disappears from the list.
  const { data: allProjects } = await supabase
    .from("projects")
    .select("owner_name");
  const owners = Array.from(
    new Set(
      (allProjects ?? [])
        .map((p) => p.owner_name)
        .filter((n): n is string => Boolean(n)),
    ),
  ).sort();

  const signalIds = projects
    .map((p) => p.signal_id)
    .filter((id): id is string => Boolean(id));

  const signalTitles = new Map<string, string>();
  if (signalIds.length > 0) {
    const { data: signals } = await supabase
      .from("signals")
      .select("id, title")
      .in("id", signalIds);
    for (const s of signals ?? []) signalTitles.set(s.id, s.title);
  }

  const activityCounts = new Map<string, number>();
  const { data: activityRows } = await supabase
    .from("activities")
    .select("project_id");
  for (const row of activityRows ?? []) {
    if (row.project_id) {
      activityCounts.set(
        row.project_id,
        (activityCounts.get(row.project_id) ?? 0) + 1,
      );
    }
  }

  const isFiltered = Boolean(params.status || params.owner);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Strategic responses to market signals — who owns what, and by when."
        action={<PrimaryLink href="/projects/new">New project</PrimaryLink>}
      />

      <ProjectFilters owners={owners} />

      {error ? (
        <ErrorState message={error.message} />
      ) : projects.length === 0 ? (
        isFiltered ? (
          <EmptyState
            title="No projects match these filters."
            description="Try a different status or owner."
            actionHref="/projects"
            actionLabel="Clear filters"
          />
        ) : (
          <EmptyState
            title="No projects yet. Create one from a signal."
            description="Turn a market signal into an owned, tracked response."
            actionHref="/signals"
            actionLabel="Browse signals"
          />
        )
      ) : (
        <>
          <p className="text-xs text-neutral-500">
            {projects.length} project{projects.length === 1 ? "" : "s"}
            {isFiltered ? " matching filters" : ""}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                signalTitle={
                  project.signal_id ? signalTitles.get(project.signal_id) : null
                }
                activityCount={activityCounts.get(project.id) ?? 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
