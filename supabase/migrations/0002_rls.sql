-- Row Level Security — every table is scoped to "the households you belong
-- to" via the members row that links your auth.uid() to a household. Both
-- Gowtham and Sanjana are members of the same household, so both can read
-- and write all shared data (per PROJECT_SPEC: "proper multi-user access
-- control, not a public link anyone can open").

create or replace function is_household_member(hh_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from members m
    where m.household_id = hh_id and m.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- households
-- ---------------------------------------------------------------------------
alter table households enable row level security;

create policy "households_select" on households for select
  using (is_household_member(id));
create policy "households_update" on households for update
  using (is_household_member(id)) with check (is_household_member(id));

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
alter table members enable row level security;

create policy "members_select" on members for select
  using (is_household_member(household_id));
create policy "members_insert" on members for insert
  with check (is_household_member(household_id));
create policy "members_update" on members for update
  using (is_household_member(household_id)) with check (is_household_member(household_id));
create policy "members_delete" on members for delete
  using (is_household_member(household_id));

-- ---------------------------------------------------------------------------
-- Generic per-table policies for every remaining household_id-scoped table.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  tables text[] := array[
    'categories', 'accounts', 'transactions', 'recurring_transactions',
    'assets', 'investments', 'liabilities', 'goals', 'budgets',
    'shopping_list', 'shopping_categories', 'shopping_trips'
  ];
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

-- ---------------------------------------------------------------------------
-- subcategories — scoped via their parent category's household
-- ---------------------------------------------------------------------------
alter table subcategories enable row level security;

create policy "subcategories_select" on subcategories for select
  using (exists (
    select 1 from categories c
    where c.id = subcategories.category_id and is_household_member(c.household_id)
  ));
create policy "subcategories_insert" on subcategories for insert
  with check (exists (
    select 1 from categories c
    where c.id = subcategories.category_id and is_household_member(c.household_id)
  ));
create policy "subcategories_update" on subcategories for update
  using (exists (
    select 1 from categories c
    where c.id = subcategories.category_id and is_household_member(c.household_id)
  ));
create policy "subcategories_delete" on subcategories for delete
  using (exists (
    select 1 from categories c
    where c.id = subcategories.category_id and is_household_member(c.household_id)
  ));

-- ---------------------------------------------------------------------------
-- shopping_items — scoped via their parent trip's household
-- ---------------------------------------------------------------------------
alter table shopping_items enable row level security;

create policy "shopping_items_select" on shopping_items for select
  using (exists (
    select 1 from shopping_trips st
    where st.id = shopping_items.trip_id and is_household_member(st.household_id)
  ));
create policy "shopping_items_insert" on shopping_items for insert
  with check (exists (
    select 1 from shopping_trips st
    where st.id = shopping_items.trip_id and is_household_member(st.household_id)
  ));
create policy "shopping_items_update" on shopping_items for update
  using (exists (
    select 1 from shopping_trips st
    where st.id = shopping_items.trip_id and is_household_member(st.household_id)
  ));
create policy "shopping_items_delete" on shopping_items for delete
  using (exists (
    select 1 from shopping_trips st
    where st.id = shopping_items.trip_id and is_household_member(st.household_id)
  ));
