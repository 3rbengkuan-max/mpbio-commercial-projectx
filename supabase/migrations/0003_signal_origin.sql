-- Sprint 5 (ingestion) — record where a signal came from.
-- Two sources per the product request: logged by a team member, or pulled from
-- internet research. Additive and idempotent; existing rows default to 'team'.

alter table signals
  add column if not exists origin text not null default 'team';

-- Backfill is implicit via the default. No data migration needed.

comment on column signals.origin is
  'team = logged by a signed-in team member; research = ingested from web research';
