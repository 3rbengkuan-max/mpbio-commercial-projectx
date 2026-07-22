import Link from "next/link";
import type { Activity, Project, Signal } from "@/lib/types";
import { formatDateTime, relativeTime, titleCase } from "@/lib/format";
import { PROJECT_STATUSES } from "@/lib/types";
import { CategoryBadge, OriginBadge, SignalTypeBadge, StatusBadge } from "./ui";

export function CountCard({
  label,
  value,
  sublabel,
  href,
}: {
  label: string;
  value: number;
  sublabel?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
      {sublabel && <p className="mt-0.5 text-xs text-neutral-500">{sublabel}</p>}
    </Link>
  );
}

/** Horizontal bar breakdown of projects by status. */
export function StatusBreakdown({ projects }: { projects: Project[] }) {
  const counts = new Map<string, number>();
  for (const p of projects) {
    const key = p.status ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = projects.length;

  const bars: Record<string, string> = {
    active: "bg-emerald-500",
    "on-hold": "bg-amber-500",
    completed: "bg-sky-500",
    dropped: "bg-neutral-400",
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">
        Projects by status
      </h2>

      {total === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No projects yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {PROJECT_STATUSES.map((status) => {
            const count = counts.get(status) ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <li key={status}>
                <Link
                  href={`/projects?status=${status}`}
                  className="group block"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700 group-hover:text-neutral-900">
                      {titleCase(status)}
                    </span>
                    <span className="text-neutral-500">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full ${bars[status] ?? "bg-neutral-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function RecentActivity({
  activities,
  projectTitles,
}: {
  activities: Activity[];
  projectTitles: Map<string, string>;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Recent activity</h2>

      {activities.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
          No updates logged yet.
        </p>
      ) : (
        <ol className="mt-4 space-y-3.5">
          {activities.map((a) => (
            <li key={a.id} className="border-l-2 border-neutral-200 pl-3">
              <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-medium text-neutral-900">
                  {a.actor_name ?? "Unknown"}
                </span>
                <span className="text-neutral-400">
                  {relativeTime(a.created_at)}
                </span>
              </div>
              {a.project_id && projectTitles.has(a.project_id) && (
                <Link
                  href={`/projects/${a.project_id}`}
                  className="mt-0.5 block text-xs font-medium text-neutral-600 underline-offset-2 hover:underline"
                >
                  {projectTitles.get(a.project_id)}
                </Link>
              )}
              <p className="mt-1 line-clamp-2 text-sm text-neutral-700">
                {a.note}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function SignalPreviewRow({ signal }: { signal: Signal }) {
  return (
    <Link
      href={`/signals/${signal.id}`}
      className="block border-b border-neutral-100 py-3 last:border-0 hover:bg-neutral-50"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <CategoryBadge value={signal.category} />
        <SignalTypeBadge value={signal.signal_type} />
        <OriginBadge value={signal.origin} />
        <span className="ml-auto text-xs text-neutral-400">
          {relativeTime(signal.created_at)}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
        {signal.title}
      </p>
    </Link>
  );
}

export function OpenProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block border-b border-neutral-100 py-3 last:border-0 hover:bg-neutral-50"
    >
      <div className="flex items-center gap-2">
        <StatusBadge value={project.status} />
        <span className="ml-auto text-xs text-neutral-500">
          {project.owner_name ?? "Unassigned"}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
        {project.title}
      </p>
    </Link>
  );
}

export function AuditPreview({
  rows,
}: {
  rows: { id: string; action: string; actor_name: string | null; created_at: string }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Audit trail</h2>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-baseline gap-x-2 text-xs">
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-700">
              {r.action}
            </code>
            <span className="text-neutral-600">{r.actor_name ?? "system"}</span>
            <span className="ml-auto text-neutral-400">
              {formatDateTime(r.created_at)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
