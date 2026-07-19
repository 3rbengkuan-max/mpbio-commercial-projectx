import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Activity, Project, Signal } from "@/lib/types";
import { formatDate, formatDateTime, isOverdue, titleCase } from "@/lib/format";
import {
  CategoryBadge,
  ErrorState,
  PriorityBadge,
  SignalTypeBadge,
  StatusBadge,
} from "@/app/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { SignInPrompt } from "@/app/components/sign-in-prompt";
import { ActivityForm } from "./activity-form";
import { ProjectControls } from "./project-controls";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return <ErrorState message={error.message} />;
  if (!project) notFound();

  const typedProject = project as Project;

  const [{ data: signalData }, { data: activityData, error: activityError }] =
    await Promise.all([
      typedProject.signal_id
        ? supabase
            .from("signals")
            .select("*")
            .eq("id", typedProject.signal_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("activities")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const signal = signalData as Signal | null;
  const activities = (activityData ?? []) as Activity[];
  const overdue = isOverdue(typedProject.due_date, typedProject.status);

  return (
    <div className="space-y-6">
      <Link
        href="/projects"
        className="inline-block text-sm text-neutral-500 hover:text-neutral-900"
      >
        ← Back to projects
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={typedProject.status} />
              <PriorityBadge value={typedProject.priority} />
            </div>

            <h1 className="mt-3 text-xl font-semibold tracking-tight text-neutral-900">
              {typedProject.title}
            </h1>

            {typedProject.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {typedProject.description}
              </p>
            )}

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-neutral-500">Owner</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {typedProject.owner_name ?? "Unassigned"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Role</dt>
                <dd className="mt-0.5 text-neutral-700">
                  {typedProject.owner_role ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Due</dt>
                <dd
                  className={`mt-0.5 ${
                    overdue ? "font-medium text-red-600" : "text-neutral-700"
                  }`}
                >
                  {formatDate(typedProject.due_date)}
                  {overdue ? " (overdue)" : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Created</dt>
                <dd className="mt-0.5 text-neutral-700">
                  {formatDate(typedProject.created_at)}
                </dd>
              </div>
            </dl>

            {typedProject.outcome && (
              <div className="mt-4 rounded-md bg-neutral-50 px-4 py-3">
                <p className="text-xs font-medium text-neutral-500">Outcome</p>
                <p className="mt-1 text-sm text-neutral-800">
                  {typedProject.outcome}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-900">
              Add an update
            </h2>
            <div className="mt-4">
              {currentUser ? (
                <ActivityForm projectId={typedProject.id} />
              ) : (
                <SignInPrompt action="add an update to this project" />
              )}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-900">
              Activity log
              {activities.length > 0 && (
                <span className="ml-2 font-normal text-neutral-400">
                  {activities.length}
                </span>
              )}
            </h2>

            {activityError ? (
              <div className="mt-4">
                <ErrorState message={activityError.message} />
              </div>
            ) : activities.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-8 text-center text-sm text-neutral-500">
                No updates yet. Add the first activity.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {activities.map((activity) => (
                  <li
                    key={activity.id}
                    className="border-l-2 border-neutral-200 pl-4"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className="font-medium text-neutral-900">
                        {activity.actor_name ?? "Unknown"}
                      </span>
                      {activity.actor_role && (
                        <span className="text-neutral-500">
                          · {activity.actor_role}
                        </span>
                      )}
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-600">
                        {titleCase(activity.action_type)}
                      </span>
                      <span className="ml-auto text-neutral-400">
                        {formatDateTime(activity.created_at)}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-neutral-700">
                      {activity.note}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {currentUser ? (
            <ProjectControls
              projectId={typedProject.id}
              currentStatus={typedProject.status}
            />
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">
                Manage project
              </h3>
              <div className="mt-3">
                <SignInPrompt action="change the status or delete this project" />
              </div>
            </div>
          )}

          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">
              Originating signal
            </h3>
            {signal ? (
              <Link
                href={`/signals/${signal.id}`}
                className="mt-3 block rounded-md border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <CategoryBadge value={signal.category} />
                  <SignalTypeBadge value={signal.signal_type} />
                </div>
                <p className="mt-2 text-sm font-medium leading-snug text-neutral-900">
                  {signal.title}
                </p>
                {signal.source_name && (
                  <p className="mt-1 text-xs text-neutral-500">
                    {signal.source_name}
                  </p>
                )}
              </Link>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                No signal linked to this project.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
