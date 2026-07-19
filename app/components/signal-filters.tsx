"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SIGNAL_CATEGORIES, SIGNAL_TYPES } from "@/lib/types";
import { titleCase } from "@/lib/format";

/**
 * Category / type filters driven by URL params, so a filtered view is
 * shareable and survives refresh (docs/TASKS.md Sprint 3).
 */
export function SignalFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const type = searchParams.get("type") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        Filter
      </span>

      <select
        aria-label="Filter by category"
        value={category}
        onChange={(e) => setParam("category", e.target.value)}
        className="rounded-md border-0 bg-neutral-50 py-1.5 pl-2.5 pr-8 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-300 focus:ring-2 focus:ring-neutral-900"
      >
        <option value="">All categories</option>
        {SIGNAL_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {titleCase(c)}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by signal type"
        value={type}
        onChange={(e) => setParam("type", e.target.value)}
        className="rounded-md border-0 bg-neutral-50 py-1.5 pl-2.5 pr-8 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-300 focus:ring-2 focus:ring-neutral-900"
      >
        <option value="">All types</option>
        {SIGNAL_TYPES.map((t) => (
          <option key={t} value={t}>
            {titleCase(t)}
          </option>
        ))}
      </select>

      {(category || type) && (
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
