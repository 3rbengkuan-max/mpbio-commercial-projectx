"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  draftResearchSignals,
  importResearchSignals,
} from "@/app/actions/research";
import {
  EMPTY_FORM_STATE,
  EMPTY_RESEARCH_STATE,
  type ResearchDraft,
} from "@/lib/types";
import { titleCase } from "@/lib/format";
import { CategoryBadge, SignalTypeBadge } from "@/app/components/ui";
import { FormError, SubmitButton } from "@/app/components/form";

export function ResearchClient() {
  const [research, runResearch, researching] = useActionState(
    draftResearchSignals,
    EMPTY_RESEARCH_STATE,
  );
  const [importState, importAction] = useActionState(
    importResearchSignals,
    EMPTY_FORM_STATE,
  );

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const drafts = research.drafts ?? [];

  // When a fresh set of drafts arrives, pre-select all of them.
  useEffect(() => {
    if (research.ok && drafts.length > 0) {
      setSelected(new Set(drafts.map((_, i) => i)));
    }
  }, [research.ok, drafts.length]);

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const chosen: ResearchDraft[] = drafts.filter((_, i) => selected.has(i));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-md">
            <h2 className="text-sm font-semibold text-neutral-900">
              Search the web for signals
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Claude searches recent news for market events relevant to MPbio,
              then drafts them below. Nothing is saved until you import.
            </p>
          </div>
          <form action={runResearch}>
            <SubmitButton pendingLabel="Researching…">
              {drafts.length > 0 ? "Search again" : "Run research"}
            </SubmitButton>
          </form>
        </div>

        {researching && (
          <p className="mt-4 text-sm text-neutral-500">
            Searching the web and drafting signals — this can take up to a
            minute.
          </p>
        )}

        {research.error && (
          <div className="mt-4">
            <FormError message={research.error} />
          </div>
        )}
      </div>

      {research.ok && drafts.length > 0 && (
        <form action={importAction} className="space-y-4">
          <input
            type="hidden"
            name="drafts"
            value={JSON.stringify(chosen)}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">
              {drafts.length} signal{drafts.length === 1 ? "" : "s"} found
              {research.searchCount
                ? ` across ${research.searchCount} web search${
                    research.searchCount === 1 ? "" : "es"
                  }`
                : ""}
              . {selected.size} selected.
            </p>
            <SubmitButton pendingLabel="Importing…">
              Import {selected.size} signal{selected.size === 1 ? "" : "s"}
            </SubmitButton>
          </div>

          <FormError message={importState.error} />

          <div className="grid gap-3">
            {drafts.map((d, i) => (
              <label
                key={i}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 shadow-sm transition-colors ${
                  selected.has(i)
                    ? "border-neutral-900 bg-white"
                    : "border-neutral-200 bg-neutral-50/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggle(i)}
                  className="mt-1 h-4 w-4 shrink-0 accent-neutral-900"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge value={d.category} />
                    <SignalTypeBadge value={d.signal_type} />
                    <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">
                      ⌕ Research
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold leading-snug text-neutral-900">
                    {d.title}
                  </h3>
                  {d.summary && (
                    <p className="mt-1 text-sm text-neutral-600">{d.summary}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                    {d.source_name && <span>{d.source_name}</span>}
                    {d.signal_date && <span>· {d.signal_date}</span>}
                    {d.source_url && (
                      <a
                        href={d.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="break-all text-blue-600 underline underline-offset-2 hover:text-blue-800"
                      >
                        source ↗
                      </a>
                    )}
                    {!d.source_url && (
                      <span className="text-amber-700">no source URL</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <p className="text-xs text-neutral-400">
            Imported signals are attributed to you and tagged as research-sourced.
            You can edit or delete any of them afterwards, like any signal.
          </p>
        </form>
      )}

      <p className="text-sm text-neutral-500">
        <Link
          href="/signals"
          className="font-medium text-neutral-700 underline underline-offset-2"
        >
          ← Back to the signal feed
        </Link>
      </p>
    </div>
  );
}
