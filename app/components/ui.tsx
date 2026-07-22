import Link from "next/link";
import { titleCase } from "@/lib/format";

/** Coloured pill for signal category. */
export function CategoryBadge({ value }: { value: string | null }) {
  const styles: Record<string, string> = {
    competitor: "bg-rose-50 text-rose-700 ring-rose-600/20",
    customer: "bg-sky-50 text-sky-700 ring-sky-600/20",
    trend: "bg-violet-50 text-violet-700 ring-violet-600/20",
    geopolitical: "bg-amber-50 text-amber-800 ring-amber-600/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[value ?? ""] ?? "bg-neutral-100 text-neutral-600 ring-neutral-500/20"
      }`}
    >
      {titleCase(value)}
    </span>
  );
}

/** Where the signal came from — team-logged or research-ingested. */
export function OriginBadge({ value }: { value: string | null }) {
  if (value !== "research") return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20"
      title="Ingested from web research"
    >
      ⌕ Research
    </span>
  );
}

/** Opportunity vs threat. */
export function SignalTypeBadge({ value }: { value: string | null }) {
  const isThreat = value === "threat";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        isThreat
          ? "bg-red-50 text-red-700 ring-red-600/20"
          : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      }`}
    >
      {isThreat ? "▼" : "▲"} {titleCase(value)}
    </span>
  );
}

export function StatusBadge({ value }: { value: string | null }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    "on-hold": "bg-amber-50 text-amber-800 ring-amber-600/20",
    completed: "bg-sky-50 text-sky-700 ring-sky-600/20",
    dropped: "bg-neutral-100 text-neutral-500 ring-neutral-500/20",
    new: "bg-blue-50 text-blue-700 ring-blue-600/20",
    reviewed: "bg-neutral-100 text-neutral-600 ring-neutral-500/20",
    archived: "bg-neutral-100 text-neutral-500 ring-neutral-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[value ?? ""] ?? "bg-neutral-100 text-neutral-600 ring-neutral-500/20"
      }`}
    >
      {titleCase(value)}
    </span>
  );
}

export function PriorityBadge({ value }: { value: string | null }) {
  const styles: Record<string, string> = {
    high: "bg-red-50 text-red-700 ring-red-600/20",
    medium: "bg-amber-50 text-amber-800 ring-amber-600/20",
    low: "bg-neutral-100 text-neutral-600 ring-neutral-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[value ?? ""] ?? "bg-neutral-100 text-neutral-600 ring-neutral-500/20"
      }`}
    >
      {titleCase(value)} priority
    </span>
  );
}

/** Shown when a query succeeds but returns nothing. */
export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-12 text-center">
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

/**
 * Shown when the database read itself failed — docs/TEST_PLAN.md requires a
 * readable message rather than an unhandled crash.
 */
export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-sm font-medium text-red-800">
        Unable to load data. Please refresh.
      </p>
      {message && <p className="mt-1 text-xs text-red-600">{message}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-700"
    >
      {children}
    </Link>
  );
}
