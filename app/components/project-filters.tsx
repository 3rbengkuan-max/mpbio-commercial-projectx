"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PROJECT_STATUSES } from "@/lib/types";
import { titleCase } from "@/lib/format";

/** Status / owner filters for the projects list (docs/TASKS.md Sprint 3). */
export function ProjectFilters({ owners }: { owners: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const owner = searchParams.get("owner") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const selectClass =
    "rounded-md border-0 bg-neutral-50 py-1.5 pl-2.5 pr-8 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-300 focus:ring-2 focus:ring-neutral-900";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        Filter
      </span>

      <select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => setParam("status", e.target.value)}
        className={selectClass}
      >
        <option value="">All statuses</option>
        {PROJECT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {titleCase(s)}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by owner"
        value={owner}
        onChange={(e) => setParam("owner", e.target.value)}
        className={selectClass}
      >
        <option value="">All owners</option>
        {owners.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      {(status || owner) && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
        >
          Clear
        </button>
      )}
    </div>
  );
}
