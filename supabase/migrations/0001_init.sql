create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  title text not null,
  source_url text,
  source_name text,
  signal_date date,
  category text,
  signal_type text,
  summary text,
  ai_summary text,
  ai_summary_source text,
  ai_summary_confidence numeric,
  ai_summary_review_status text default 'unreviewed',
  ai_relevance_score numeric,
  ai_relevance_score_source text,
  ai_relevance_score_confidence numeric,
  ai_relevance_score_review_status text default 'unreviewed',
  ai_suggested_category text,
  ai_suggested_category_source text,
  ai_suggested_category_confidence numeric,
  ai_suggested_category_review_status text default 'unreviewed',
  status text default 'new'
);

alter table signals enable row level security;
drop policy if exists "signals_v1_read" on signals;
create policy "signals_v1_read" on signals for select using (true);
drop policy if exists "signals_v1_write" on signals;
create policy "signals_v1_write" on signals for all using (true) with check (true);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  signal_id uuid references signals(id),
  owner_name text,
  owner_role text,
  status text default 'active',
  priority text default 'medium',
  due_date date,
  outcome text
);

alter table projects enable row level security;
drop policy if exists "projects_v1_read" on projects;
create policy "projects_v1_read" on projects for select using (true);
drop policy if exists "projects_v1_write" on projects;
create policy "projects_v1_write" on projects for all using (true) with check (true);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  project_id uuid references projects(id),
  signal_id uuid references signals(id),
  actor_name text,
  actor_role text,
  action_type text,
  note text,
  status_change_from text,
  status_change_to text
);

alter table activities enable row level security;
drop policy if exists "activities_v1_read" on activities;
create policy "activities_v1_read" on activities for select using (true);
drop policy if exists "activities_v1_write" on activities;
create policy "activities_v1_write" on activities for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  actor_name text,
  action text,
  target_table text,
  target_id uuid,
  detail jsonb
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into signals (id, title, source_url, source_name, signal_date, category, signal_type, summary, status) values
  ('a1000000-0000-0000-0000-000000000001', 'Thermo Fisher launches new rapid immunoassay kit targeting clinical diagnostics segment', 'https://www.thermofisher.com/news/2024-immunoassay', 'Thermo Fisher Press', '2024-06-10', 'competitor', 'threat', 'Thermo Fisher announced a new rapid immunoassay kit directly competing with MPbio''s current clinical diagnostics line. Pricing is 12% below current market average.', 'new'),
  ('a1000000-0000-0000-0000-000000000002', 'US NIH increases life science R&D budget by 8% for FY2025', 'https://www.nih.gov/news/budget-2025', 'NIH.gov', '2024-06-08', 'trend', 'opportunity', 'NIH FY2025 budget includes an 8% uplift for life science R&D grants. Historically drives increased lab reagent and consumable purchasing.', 'new'),
  ('a1000000-0000-0000-0000-000000000003', 'EU export controls tightening on biochemical raw materials impacting APAC supply chains', 'https://www.reuters.com/eu-biochem-export', 'Reuters', '2024-06-07', 'geopolitical', 'threat', 'New EU regulations may restrict raw material exports used in enzyme production. APAC distributors flagging lead time concerns.', 'new'),
  ('a1000000-0000-0000-0000-000000000004', 'Major CRO expands into Southeast Asia — new lab infrastructure spending expected', 'https://www.biospace.com/cro-sea-expansion', 'BioSpace', '2024-06-05', 'customer', 'opportunity', 'A top-10 global CRO is opening three new labs in Singapore and Vietnam. Estimated consumable spend per site: $500K/year.', 'new'),
  ('a1000000-0000-0000-0000-000000000005', 'Sigma-Aldrich announces 15% price increase on cell culture media effective Q3 2024', 'https://www.sigmaaldrich.com/price-update', 'Sigma-Aldrich', '2024-06-03', 'competitor', 'opportunity', 'Sigma price hike creates a switching window. MPbio cell culture portfolio can be positioned as a stable-priced alternative.', 'new');

insert into projects (id, title, description, signal_id, owner_name, owner_role, status, priority, due_date) values
  ('b1000000-0000-0000-0000-000000000001', 'Counter Thermo Fisher immunoassay launch — positioning response', 'Develop a competitive counter-brief and customer communication plan highlighting MPbio differentiation on specificity and lead time.', 'a1000000-0000-0000-0000-000000000001', 'Sarah Tan', 'Product Specialist', 'active', 'high', '2024-07-15'),
  ('b1000000-0000-0000-0000-000000000002', 'NIH budget opportunity — targeted outreach to US academic accounts', 'Identify top 20 US academic lab customers likely to receive increased NIH grants and coordinate sales outreach with tailored bundles.', 'a1000000-0000-0000-0000-000000000002', 'James Lim', 'Business Developer', 'active', 'high', '2024-07-30'),
  ('b1000000-0000-0000-0000-000000000003', 'Sigma price hike — win-back campaign for cell culture customers', 'Design a 3-month campaign targeting Sigma cell culture customers with MPbio pricing stability messaging and sample offers.', 'a1000000-0000-0000-0000-000000000005', 'Wei Chen', 'Sales Manager', 'active', 'medium', '2024-08-01');

insert into activities (project_id, actor_name, actor_role, action_type, note) values
  ('b1000000-0000-0000-0000-000000000001', 'Sarah Tan', 'Product Specialist', 'comment', 'Drafted initial competitive comparison table. Sharing with FAS team for technical review.'),
  ('b1000000-0000-0000-0000-000000000002', 'James Lim', 'Business Developer', 'comment', 'Pulled list of top NIH-funded accounts from CRM. 23 accounts identified. Scheduling outreach calls for next week.'),
  ('b1000000-0000-0000-0000-000000000003', 'Wei Chen', 'Sales Manager', 'status_change', 'Kicked off project. Customer service to compile list of accounts who purchased Sigma cell culture in last 12 months.');