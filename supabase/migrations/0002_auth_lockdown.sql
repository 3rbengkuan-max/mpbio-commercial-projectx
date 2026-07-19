-- Sprint 4 — Lock It Down.
-- Replaces the permissive v1 policies with authenticated writes and owner checks.
-- Reads stay public: docs/TASKS.md requires an unauthenticated visitor to still
-- be able to view the dashboard and feed, just not submit anything.

-- ── profiles ────────────────────────────────────────────────────────────────
-- auth.users is not directly readable by the app, so mirror the display name and
-- team role into a profiles table that policies and the UI can both use.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  full_name text,
  role text
);

alter table profiles enable row level security;

drop policy if exists "profiles_read" on profiles;
create policy "profiles_read" on profiles
  for select using (true);

drop policy if exists "profiles_insert_self" on profiles;
create policy "profiles_insert_self" on profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self" on profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Populate a profile automatically on signup from the metadata the app sends,
-- so a profile always exists even if the client never gets a chance to insert.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'role', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── helpers ─────────────────────────────────────────────────────────────────
-- docs/SECURITY.md: the Sales Manager role may edit any row.
create or replace function is_sales_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'Sales Manager'
  );
$$;

-- The rows seeded in 0001 have a null user_id, so nobody owns them. Treat them
-- as shared demo data any authenticated team member may edit or delete —
-- CLAUDE.md calls seeded rows placeholders the user can also change.
create or replace function can_write_row(row_user_id uuid)
returns boolean
language sql
stable
as $$
  select auth.uid() is not null
     and (row_user_id is null or row_user_id = auth.uid() or public.is_sales_manager());
$$;

-- ── signals ─────────────────────────────────────────────────────────────────
drop policy if exists "signals_v1_read" on signals;
drop policy if exists "signals_v1_write" on signals;

create policy "signals_read" on signals
  for select using (true);
create policy "signals_insert" on signals
  for insert to authenticated with check (auth.uid() = user_id);
create policy "signals_update" on signals
  for update to authenticated using (can_write_row(user_id)) with check (can_write_row(user_id));
create policy "signals_delete" on signals
  for delete to authenticated using (can_write_row(user_id));

-- ── projects ────────────────────────────────────────────────────────────────
drop policy if exists "projects_v1_read" on projects;
drop policy if exists "projects_v1_write" on projects;

create policy "projects_read" on projects
  for select using (true);
create policy "projects_insert" on projects
  for insert to authenticated with check (auth.uid() = user_id);
create policy "projects_update" on projects
  for update to authenticated using (can_write_row(user_id)) with check (can_write_row(user_id));
create policy "projects_delete" on projects
  for delete to authenticated using (can_write_row(user_id));

-- ── activities ──────────────────────────────────────────────────────────────
drop policy if exists "activities_v1_read" on activities;
drop policy if exists "activities_v1_write" on activities;

create policy "activities_read" on activities
  for select using (true);
create policy "activities_insert" on activities
  for insert to authenticated with check (auth.uid() = user_id);
create policy "activities_update" on activities
  for update to authenticated using (can_write_row(user_id)) with check (can_write_row(user_id));
create policy "activities_delete" on activities
  for delete to authenticated using (can_write_row(user_id));

-- ── audit_logs ──────────────────────────────────────────────────────────────
-- Append-only by design (docs/SECURITY.md): no update or delete policy exists,
-- so RLS denies both even to authenticated users.
drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;

create policy "audit_logs_read" on audit_logs
  for select using (true);
create policy "audit_logs_insert" on audit_logs
  for insert to authenticated with check (auth.uid() = user_id);
