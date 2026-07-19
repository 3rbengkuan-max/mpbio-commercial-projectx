# Test Plan

## Success Scenario (manual walkthrough)

> From Sprint 4 onward the app is private: every route redirects to `/login`
> when signed out, and RLS grants reads to authenticated users only. Steps 1
> and 10 below assume you are signed in.

1. Sign in as a team member in Browser A — dashboard loads with seeded signals and projects.
2. Click **Log Signal** → fill: title="BioLegend launches competing ELISA kit", source URL, category=`competitor`, type=`threat`, summary=free text → Submit.
3. Confirm: redirected to signal feed; new signal card appears at top with correct category badge.
4. Open Supabase table viewer — confirm new row in `signals` and matching row in `audit_logs`.
5. Click signal card → signal detail page → click **Create Project from Signal**.
6. Fill: title="Counter BioLegend ELISA — competitive response", owner=`Sarah Tan`, role=`Product Specialist`, priority=`high`, due date=next month → Submit.
7. Confirm: project appears on `/projects` list with correct owner and status `active`.
8. Open project detail → click **Add Activity** → fill: actor=`James Lim`, role=`Business Developer`, type=`comment`, note=`Drafting pricing comparison sheet` → Submit.
9. Confirm: activity appears in project activity log with timestamp.
10. Open Browser B (incognito) → navigate to `/` → confirm redirect to `/login`, then sign in as a second team member → count cards show updated numbers; signal, project, and activity all visible.

## Empty State Tests
- Delete all seeded rows → signal feed shows "No signals logged yet. Be the first to add one." with Log Signal CTA
- Projects list with no rows → "No projects yet. Create one from a signal."
- Project detail with no activities → "No updates yet. Add the first activity."

## Error State Tests
- Submit Log Signal form with empty title → inline validation error, no DB insert
- Submit Create Project with no signal selected → validation error shown
- Simulate DB unavailable → pages show "Unable to load data. Please refresh." — no unhandled crash
- Submit activity with note > 2000 chars → truncation warning shown before submit

## Data Integrity Tests
- Confirm `audit_logs` row written for every signal create, project create, activity create
- Confirm `signal_id` FK on project points to valid signal row
- Confirm page refresh shows same data (no localStorage-only state)
