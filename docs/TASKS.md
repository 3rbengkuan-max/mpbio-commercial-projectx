# Tasks & Sprints

## Sprint 1 — Database & Signal Logging
**Goal:** Schema live, demo data visible, team can log a signal.

- [ ] Apply migration SQL to Supabase (signals, projects, activities, audit_logs + v1 RLS)
- [ ] Seed 5 demo signals and 3 demo projects
- [ ] Build `/` homepage = Signal Feed (server component): list signals, cards show title/category/type/date
- [ ] Handle loading, empty, error states on Signal Feed
- [ ] Build Log Signal form (`/signals/new`): title, source URL, source name, signal date, category, type, summary
- [ ] Server action: validate + insert into `signals` + write `audit_logs` row
- [ ] On success: redirect to signal feed; new signal appears at top
- [ ] Test: submit form → row in Supabase → card on feed

**Definition of Done:** A new signal submitted via the form appears on the feed on the next page load. Supabase row confirmed. No login required.

---

## Sprint 2 — Projects & Activity Log (Core Engine) ✦ v1 functional milestone
**Goal:** Full workflow works end-to-end: signal → project → activity → visible to all.

- [ ] Build `/projects` page: list all projects, status badge, owner name, priority, due date
- [ ] Build Create Project form (`/projects/new`): title, description, linked signal (dropdown), owner name, owner role, priority, due date
- [ ] Server action: insert `projects` row + `audit_logs` entry
- [ ] Build Project detail page (`/projects/[id]`): metadata + activity log list
- [ ] Build Add Activity form on project detail: actor name, actor role, action type, note
- [ ] Server action: insert `activities` row + `audit_logs` entry
- [ ] Handle loading/empty/error on all pages
- [ ] Signal detail page (`/signals/[id]`): show linked projects
- [ ] Test: log signal → create project → add activity → second browser tab sees all three

**Definition of Done:** Full scenario (signal → project → activity) completes without error. Data persists across page refresh. Two browser tabs show identical state.

---

## Sprint 3 — Operational Dashboard
**Goal:** Team has a single shared view of everything happening.

- [ ] Build `/dashboard`: count cards (open signals, active projects, activities this week)
- [ ] Signal feed preview (5 most recent, with category + type filter)
- [ ] Projects by status breakdown (active / on-hold / completed)
- [ ] Recent activity stream (last 10 activities across all projects)
- [ ] Filter signals by category and signal_type
- [ ] Filter projects by status and owner_name
- [ ] All filters work without page reload (client-side state or URL params)
- [ ] Dashboard is the `/` homepage (replaces plain signal list)

**Definition of Done:** Dashboard loads with real DB data, filters work, all count cards are accurate, no hardcoded values.

---

## Sprint 4 — Lock It Down (Auth + Per-User Identity)
**Goal:** Actions are attributed to real logged-in users; data is protected.

- [ ] Enable Supabase Auth; add `/login` and `/signup` pages
- [ ] Populate `user_id` on all inserts after login
- [ ] Display logged-in user name in nav and on activity entries
- [ ] Add role selection on signup (Sales Manager, Business Developer, etc.)
- [ ] Replace v1 open RLS policies with team-scoped read + owner-write policies
- [ ] Protect all app routes (redirect to login if unauthenticated)
- [ ] Dashboard and feed remain readable when logged in
- [ ] Test: unauthenticated user is redirected to login and RLS returns no rows

> **Decision (supersedes the earlier "unauthenticated user can view" test):**
> reads are gated to authenticated team members, not public. This workspace
> holds competitor intelligence and named customer accounts, so URL-only access
> is not acceptable. This matches `SECURITY.md`, which always specified
> team-scoped read; the earlier public-read wording here and in `TEST_PLAN.md`
> was the inconsistency. The no-login-wall rule in `CLAUDE.md` applies to v1
> *before* this sprint — locking down is the point of Sprint 4.

**Definition of Done:** Logged-in user's name appears on their submissions. Unauthenticated reads and writes are rejected by RLS. Existing demo rows still visible to signed-in users.

---

## Sprint 5 — AI Intelligence Layer
**Goal:** Signals are automatically summarised and scored; team reviews inline.

- [ ] On signal save, call `llm_summarise` server-side → store `ai_summary` + source + confidence
- [ ] On signal save, call `llm_score_relevance` → store `ai_relevance_score` fields
- [ ] On signal save, call `llm_suggest_category` → store `ai_suggested_category` fields
- [ ] Signal detail shows AI suggestions with `review_status` badge
- [ ] Accept / Override buttons update `review_status` field and write audit log
- [ ] If AI call fails, signal saves successfully with null AI fields (no blocking error)
- [ ] Test: log signal → AI fields populated in DB → accept suggestion → audit log row written

**Definition of Done:** AI fields appear on signal detail. Accept/Override persists to DB. App saves signal correctly when AI is unavailable.

---

## Gantt (sprint → feature)
```
Sprint 1: DB schema, seed data, signal feed, log signal form
Sprint 2: Projects CRUD, activity log, signal detail, end-to-end flow  ← v1 functional
Sprint 3: Dashboard, filters, count cards
Sprint 4: Auth, login, RLS lock-down, user attribution
Sprint 5: AI summarisation, scoring, accept/override UI
```
