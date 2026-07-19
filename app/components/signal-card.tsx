import Link from "next/link";
import type { Signal } from "@/lib/types";
import { formatDate, relativeTime } from "@/lib/format";
import { CategoryBadge, SignalTypeBadge } from "./ui";

export function SignalCard({
  signal,
  projectCount,
}: {
  signal: Signal;
  projectCount?: number;
}) {
  return (
    <Link
      href={`/signals/${signal.id}`}
      className="block rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge value={signal.category} />
        <SignalTypeBadge value={signal.signal_type} />
        <span className="ml-auto text-xs text-neutral-400">
          {relativeTime(signal.created_at)}
        </span>
      </div>

      <h3 className="mt-2.5 text-sm font-semibold leading-snug text-neutral-900">
        {signal.title}
      </h3>

      {signal.summary && (
        <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600">
          {signal.summary}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
        {signal.source_name && <span>{signal.source_name}</span>}
        {signal.signal_date && <span>· {formatDate(signal.signal_date)}</span>}
        {projectCount !== undefined && projectCount > 0 && (
          <span className="font-medium text-neutral-700">
            · {projectCount} linked project{projectCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </Link>
  );
}
