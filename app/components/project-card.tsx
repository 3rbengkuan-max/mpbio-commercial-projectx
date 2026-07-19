import Link from "next/link";
import type { Project } from "@/lib/types";
import { formatDate, isOverdue } from "@/lib/format";
import { PriorityBadge, StatusBadge } from "./ui";

export function ProjectCard({
  project,
  signalTitle,
  activityCount,
}: {
  project: Project;
  signalTitle?: string | null;
  activityCount?: number;
}) {
  const overdue = isOverdue(project.due_date, project.status);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge value={project.status} />
        <PriorityBadge value={project.priority} />
      </div>

      <h3 className="mt-2.5 text-sm font-semibold leading-snug text-neutral-900">
        {project.title}
      </h3>

      {project.description && (
        <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600">
          {project.description}
        </p>
      )}

      {signalTitle && (
        <p className="mt-2 line-clamp-1 text-xs text-neutral-500">
          ↳ from signal: {signalTitle}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span className="font-medium text-neutral-700">
          {project.owner_name ?? "Unassigned"}
        </span>
        {project.owner_role && <span>· {project.owner_role}</span>}
        {project.due_date && (
          <span className={overdue ? "font-medium text-red-600" : ""}>
            · Due {formatDate(project.due_date)}
            {overdue ? " (overdue)" : ""}
          </span>
        )}
        {activityCount !== undefined && (
          <span>
            · {activityCount} update{activityCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </Link>
  );
}
