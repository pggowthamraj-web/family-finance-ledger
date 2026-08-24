-- Family Finance Ledger — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) before anything else.
--
-- Design notes:
-- * IDs are `text` (not `uuid`) on purpose: the source data export already has
--   stable string ids (e.g. "a_ukcurrent", "cat_groceries", "t_00001"). Reusing
--   them verbatim makes the one-time import trivial and keeps the data
--   human-legible. New rows created by the app get a random text id via the
--   column defaults below.
-- * Every table (other than households itself) carries household_id so RLS can
--   scope access per-household. This app has exactly one household today, but
--   the schema supports more than one without changes.
-- * Money is `numeric(14,2)`. Original transaction currency is always kept —
--   never overwritten by a converted value (see PROJECT_SPEC "Multi-currency rule").

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- households
-- ---------------------------------------------------------------------------
create table households (
  id text primary key default ('hh_' || substr(gen_random_uuid()::text, 1, 8)),
  name text not null default 'Household',
  base_currency text not null default 'GBP',
  exchange_rates jsonb not null default '{"GBP":1,"INR":0.0095,"USD":0.79,"EUR":0.86}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- members (one row per real login; user_id is filled in once the person has
-- a Supabase Auth account and you've linked it — see supabase/seed/README)
-- ---------------------------------------------------------------------------
create table members (
  id text primary key default ('m_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  name text not null,
  role text,
  color text,
  created_at timestamptz not null default now()
);
create unique index members_user_id_idx on members(user_id) where user_id is not null;
create index members_household_idx on members(household_id);

-- ---------------------------------------------------------------------------
-- categories / subcategories (user-defined, not hardcoded)
-- ---------------------------------------------------------------------------
create table categories (
  id text primary key default ('cat_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  name text not null,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index categories_household_idx on categories(household_id);

create table subcategories (
  id text primary key default ('sub_' || substr(gen_random_uuid()::text, 1, 8)),
  category_id text not null references categories(id) on delete cascade,
  name text not null
);
create index subcategories_category_idx on subcategories(category_id);

-- ---------------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------------
create table accounts (
  id text primary key default ('a_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  name text not null,
  type text not null check (type in (
    'Bank Account', 'Cash', 'Credit Card', 'Savings Account',
    'Investment Account', 'Digital Wallet'
  )),
  currency text not null default 'GBP',
  balance numeric(14, 2) not null default 0,
  owner_id text references members(id) on delete set null,
  country text,
  notes text,
  -- true for accounts derived from internal-transfer patterns rather than a
  -- direct statement (see PROJECT_SPEC "derived placeholders"). Surfaced in
  -- the UI as a badge so the balance is never mistaken for a verified figure.
  is_derived_placeholder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index accounts_household_idx on accounts(household_id);

-- ---------------------------------------------------------------------------
-- transactions
-- ---------------------------------------------------------------------------
create table transactions (
  id text primary key default ('t_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  type text not null check (type in ('expense', 'income', 'transfer')),
  date date not null,
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null,
  category_id text references categories(id) on delete set null,
  subcategory_id text references subcategories(id) on delete set null,
  description text,
  person_id text references members(id) on delete set null,
  entered_by_id text references members(id) on delete set null,
  account_id text not null references accounts(id) on delete cascade,
  to_account_id text references accounts(id) on delete set null,
  recurring boolean not null default false,
  notes text,
  country text,
  -- optional itemized receipt lines: [{ name, quantity, price, categoryId }]
  items jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text references members(id) on delete set null,
  updated_by text references members(id) on delete set null,
  constraint transfer_requires_to_account check (
    (type = 'transfer' and to_account_id is not null) or (type <> 'transfer')
  )
);
create index transactions_household_date_idx on transactions(household_id, date desc);
create index transactions_category_idx on transactions(household_id, category_id);
create index transactions_person_idx on transactions(household_id, person_id);
create index transactions_account_idx on transactions(account_id);
create index transactions_to_account_idx on transactions(to_account_id);

-- ---------------------------------------------------------------------------
-- recurring_transactions — informational only, does NOT feed transaction
-- totals. Only rolls into a separate "recurring monthly commitment" figure.
-- ---------------------------------------------------------------------------
create table recurring_transactions (
  id text primary key default ('r_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  description text not null,
  amount numeric(14, 2) not null,
  currency text not null default 'GBP',
  category_id text references categories(id) on delete set null,
  subcategory_id text references subcategories(id) on delete set null,
  frequency text not null check (frequency in (
    'weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'
  )),
  account_id text references accounts(id) on delete set null,
  person_id text references members(id) on delete set null,
  active boolean not null default true,
  type text not null check (type in ('expense', 'income')),
  notes text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);
create index recurring_household_idx on recurring_transactions(household_id);

-- ---------------------------------------------------------------------------
-- assets
-- ---------------------------------------------------------------------------
create table assets (
  id text primary key default ('as_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  name text not null,
  type text not null,
  owner_id text references members(id) on delete set null,
  purchase_date date,
  purchase_value numeric(14, 2) not null default 0,
  current_value numeric(14, 2) not null default 0,
  currency text not null default 'GBP',
  country text,
  notes text,
  valuation_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index assets_household_idx on assets(household_id);

-- ---------------------------------------------------------------------------
-- investments (LIC / mutual funds / PPF / stocks / FDs — separate from assets)
-- ---------------------------------------------------------------------------
create table investments (
  id text primary key default ('inv_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  type text not null check (type in (
    'LIC Insurance', 'Mutual Fund', 'PPF', 'Stocks', 'Fixed Deposit', 'Other'
  )),
  name text not null,
  provider text,
  owner_id text references members(id) on delete set null,
  currency text not null default 'GBP',
  invested_amount numeric(14, 2) not null default 0,
  current_value numeric(14, 2) not null default 0,
  start_date date,
  maturity_date date,
  maturity_amount numeric(14, 2),
  premium_amount numeric(14, 2),
  premium_frequency text check (premium_frequency in (
    'weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'
  )),
  folio_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index investments_household_idx on investments(household_id);

-- ---------------------------------------------------------------------------
-- liabilities
-- ---------------------------------------------------------------------------
create table liabilities (
  id text primary key default ('li_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  name text not null,
  type text not null check (type in (
    'Mortgage', 'Car Loan', 'Personal Loan', 'Credit Card', 'Education Loan', 'Other'
  )),
  original_amount numeric(14, 2) not null default 0,
  current_amount numeric(14, 2) not null default 0,
  currency text not null default 'GBP',
  interest_rate numeric(6, 3) not null default 0,
  monthly_payment numeric(14, 2) not null default 0,
  start_date date,
  expected_end_date date,
  account_id text references accounts(id) on delete set null,
  person_id text references members(id) on delete set null,
  notes text,
  -- true when notes flag this as "unconfirmed — not found in either statement"
  is_unconfirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index liabilities_household_idx on liabilities(household_id);

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
create table goals (
  id text primary key default ('g_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  name text not null,
  description text,
  target_amount numeric(14, 2) not null,
  currency text not null default 'GBP',
  target_date date,
  current_amount numeric(14, 2) not null default 0,
  monthly_contribution numeric(14, 2) not null default 0,
  account_id text references accounts(id) on delete set null,
  priority text check (priority in ('Low', 'Medium', 'High')),
  -- a members.id, or the literal string 'shared'
  owner_id text,
  notes text,
  contributions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index goals_household_idx on goals(household_id);

-- ---------------------------------------------------------------------------
-- budgets
-- ---------------------------------------------------------------------------
create table budgets (
  id text primary key default ('b_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  category_id text references categories(id) on delete cascade,
  person_id text references members(id) on delete set null,
  amount numeric(14, 2) not null,
  currency text not null default 'GBP',
  period text not null default 'monthly' check (period = 'monthly'),
  created_at timestamptz not null default now()
);
create index budgets_household_idx on budgets(household_id);

-- ---------------------------------------------------------------------------
-- shopping_list — lightweight quick list inside the finance app
-- ---------------------------------------------------------------------------
create table shopping_list (
  id text primary key default ('sl_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  name text not null,
  checked boolean not null default false,
  added_at timestamptz not null default now()
);
create index shopping_list_household_idx on shopping_list(household_id);

-- ---------------------------------------------------------------------------
-- Companion app: grocery / shopping tracker.
-- Deliberately separate from accounts/transactions above — no shared balance,
-- no double-counting risk (see PROJECT_SPEC).
-- ---------------------------------------------------------------------------
create table shopping_categories (
  id text primary key,
  household_id text not null references households(id) on delete cascade,
  name text not null
);
create index shopping_categories_household_idx on shopping_categories(household_id);

create table shopping_trips (
  id text primary key default ('trip_' || substr(gen_random_uuid()::text, 1, 8)),
  household_id text not null references households(id) on delete cascade,
  store text not null,
  date date not null,
  currency text not null default 'GBP',
  notes text,
  created_at timestamptz not null default now()
);
create index shopping_trips_household_idx on shopping_trips(household_id, date desc);

create table shopping_items (
  id text primary key default ('item_' || substr(gen_random_uuid()::text, 1, 8)),
  trip_id text not null references shopping_trips(id) on delete cascade,
  name text not null,
  quantity numeric(10, 2) not null default 1,
  price numeric(10, 2) not null default 0,
  category_id text references shopping_categories(id) on delete set null
);
create index shopping_items_trip_idx on shopping_items(trip_id);
