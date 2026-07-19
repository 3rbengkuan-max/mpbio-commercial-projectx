# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS — deployed on Vercel
- **Database:** Supabase (Postgres) — single source of truth
- **Auth (later):** Supabase Auth — added in Lock It Down sprint
- **AI (later):** OpenAI API called server-side only, result stored in DB

## What to Build Now vs Later
**Now:** Signal logging form, project tracker, activity log, shared dashboard — all reading/writing Supabase directly via server components and server actions.
**Later:** Auth, AI summarisation, automated feed ingestion, email digests.

## Key User Action — Step-by-Step
1. Team member sees a competitor announcement online
2. Opens the app → clicks **Log Signal** → fills form (title, URL, category = `competitor`, type = `threat`, summary)
3. Next.js server action validates and inserts row into `signals` table
4. User clicks **Create Project from Signal** → fills title, owner name, due date
5. Server action inserts row into `projects` with `signal_id` FK
6. User adds a first activity note → inserts into `activities` with `project_id`
7. Dashboard query (server component) reads `signals`, `projects`, `activities` — renders live counts and lists
8. Colleague opens same URL → sees identical data from same DB

## Layer Order
1. **Database** — tables, constraints, RLS policies, seed data
2. **App logic** — CRUD server actions, form validation, status transitions
3. **Intelligence** — AI field population added on top; core works without it

## Why Core Runs Without AI
All fields have manual-entry equivalents. AI fields are nullable. Removing the AI call leaves a fully operational team tracker.
