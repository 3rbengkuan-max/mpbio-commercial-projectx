import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Project, Signal } from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  CategoryBadge,
  ErrorState,
  PrimaryLink,
  SignalTypeBadge,
  StatusBadge,
} from "@/app/components/ui";
import { ProjectCard } from "@/app/components/project-card";
import { getCurrentUser } from "@/lib/auth";
import { SignInPrompt } from "@/app/components/sign-in-prompt";
import { SignalControls } from "./signal-controls";

export const dynamic = "force-dynamic";

export default async function SignalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: signal, error } = await supabase
    .from("signals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return <ErrorState message={error.message} />;
  if (!signal) notFound();

  const typedSignal = signal as Signal;

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("signal_id", id)
    .order("created_at", { ascending: false });

  const projects = (projectData ?? []) as Project[];

  return (
    <div className="space-y-6">
      <Link
        href="/signals"
        className="inline-block text-sm text-neutral-500 hover:text-neutral-900"
      >
        ← Back to signal feed
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge value={typedSignal.category} />
              <SignalTypeBadge value={typedSignal.signal_type} />
              <StatusBadge value={typedSignal.status} />
            </div>

            <h1 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-neutral-900">
              {typedSignal.title}
            </h1>

            {typedSignal.summary && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {typedSignal.summary}
              </p>
            )}

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-neutral-500">Source</dt>
                <dd className="mt-0.5 text-neutral-700">
                  {typedSignal.source_name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Signal date</dt>
                <dd className="mt-0.5 text-neutral-700">
                  {formatDate(typedSignal.signal_date)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Logged</dt>
                <dd className="mt-0.5 text-neutral-700">
                  {formatDate(typedSignal.created_at)}
                </dd>
              </div>
            </dl>

            {typedSignal.source_url && (
              <a
                href={typedSignal.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block break-all text-sm text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                {typedSignal.source_url} ↗
              </a>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-neutral-900">
                Linked projects
                {projects.length > 0 && (
                  <span className="ml-2 font-normal text-neutral-400">
                    {projects.length}
                  </span>
                )}
              </h2>
              <PrimaryLink href={`/projects/new?signal=${typedSignal.id}`}>
                Create project from signal
              </PrimaryLink>
            </div>

            {projectError ? (
              <div className="mt-4">
                <ErrorState message={projectError.message} />
              </div>
            ) : projects.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-8 text-center text-sm text-neutral-500">
                No projects yet. Create one to act on this signal.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          {currentUser ? (
            <SignalControls
              signalId={typedSignal.id}
              currentStatus={typedSignal.status}
              linkedProjectCount={projects.length}
            />
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">
                Manage signal
              </h3>
              <div className="mt-3">
                <SignInPrompt action="change the status or delete this signal" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
