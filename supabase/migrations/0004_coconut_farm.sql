-- Yash Coconut Farm — a household side-venture tracked separately from the
-- generic finance schema. Two record types:
--   1. Harvests: coconuts sold (small/big, priced per coconut) minus labour
--      and watchman costs for that harvest -> income is derived at
--      display/aggregation time, never stored (same convention as net worth).
--   2. Fertiliser/manure applications: per-tree fertiliser + labour cost.
-- ---------------------------------------------------------------------------

create table farm_harvests (
  id text primary key default ('fh_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  harvest_date date not null,
  trees_harvested integer not null default 0,
  small_coconuts_count integer not null default 0,
  small_coconut_price numeric(10, 2) not null default 0, -- per coconut
  big_coconuts_count integer not null default 0,
  big_coconut_price numeric(10, 2) not null default 0, -- per coconut
  watchman_salary numeric(14, 2) not null default 0,
  labour_charges numeric(14, 2) not null default 0,
  currency text not null default 'INR',
  performed_by text, -- free-text person/firm who did the harvest
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index farm_harvests_household_idx on farm_harvests(household_id);

create table farm_fertilizer_applications (
  id text primary key default ('ff_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  application_date date not null,
  trees_count integer not null default 0,
  fertilizer_cost_per_tree numeric(10, 2) not null default 0,
  labour_cost_per_tree numeric(10, 2) not null default 0,
  currency text not null default 'INR',
  performed_by text, -- free-text person/firm who applied it
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index farm_fertilizer_household_idx on farm_fertilizer_applications(household_id);

-- ---------------------------------------------------------------------------
-- RLS — same is_household_member() policy shape as every other
-- household_id-scoped table (see 0002_rls.sql).
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  tables text[] := array['farm_harvests', 'farm_fertilizer_applications'];
begin
  foreach t in array tables loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy "%s_select" on %I for select using (is_household_member(household_id));',
      t, t
    );
    execute format(
      'create policy "%s_insert" on %I for insert with check (is_household_member(household_id));',
      t, t
    );
    execute format(
      'create policy "%s_update" on %I for update using (is_household_member(household_id)) with check (is_household_member(household_id));',
      t, t
    );
    execute format(
      'create policy "%s_delete" on %I for delete using (is_household_member(household_id));',
      t, t
    );
  end loop;
end $$;
