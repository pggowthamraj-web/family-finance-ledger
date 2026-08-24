# Family Finance Ledger

Shared household finance tracker for Gowtham and Sanjana — rebuilt from a
Claude.ai artifact prototype into a real app: Next.js (App Router) +
Supabase (Postgres, Auth, Row Level Security) + Vercel.

See `PROJECT_SPEC.md`-derived business logic in `src/lib/finance/` — every
rule from the spec (transfer exclusion, salary month-shift, recurring
commitment normalization, goal formulas, net worth, receipt-item attach
flow) has a small, separately testable module there.

## Stack

- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Database + Auth**: Supabase (Postgres, Auth, RLS)
- **Hosting**: Vercel
- **Charts**: Recharts · **Icons**: lucide-react

## First-time setup

### 1. Install dependencies

```
npm install
```

### 2. Create a Supabase project

[supabase.com/dashboard](https://supabase.com/dashboard) → New project. Once
it's ready, go to **Project Settings → API** and copy:

- Project URL
- `anon` / publishable key
- `service_role` / secret key (only needed locally for the import script —
  never put it in `NEXT_PUBLIC_*` or ship it to the browser)

Copy `.env.example` to `.env.local` and fill those in.

### 3. Run the schema + seed the data

In the Supabase SQL editor (Project → SQL Editor → New query), run these
**in order**, each as its own query:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_auth_link.sql`
4. `supabase/seed/seed.sql` — generate this first if it isn't already
   present (it's git-ignored on purpose, see `supabase/seed/README.md`):

   ```
   node scripts/generate-seed-sql.mjs \
     /path/to/family-finance-data-export.json \
     /path/to/shopping-tracker-data-export.json \
     gowtham@email.com sanjana@email.com
   ```

   Or, with network access to your Supabase project (e.g. from your own
   machine, not a locked-down sandbox), skip the SQL file and run the
   importer directly — same transformation, upserts so it's safe to re-run:

   ```
   npm run import:data -- /path/to/family-finance-data-export.json /path/to/shopping-tracker-data-export.json
   ```

### 4. Create the two logins

Supabase dashboard → **Authentication → Users → Add user**, once each for
Gowtham and Sanjana, using the same email addresses baked into the
`members` rows in step 3. A trigger (`0003_auth_link.sql`) links each new
Auth user to their `members` row automatically by matching email — no
manual SQL needed. If a member's email wasn't set at seed time, set it from
the app's Settings → Family Members screen before that person signs up, or
run:

```sql
update members set email = 'their-email@example.com' where id = 'm_gowtham';
```

### 5. Run locally

```
npm run dev
```

### 6. Deploy to Vercel

Push this repo to GitHub, then [vercel.com/new](https://vercel.com/new) →
import the repo → add the two `NEXT_PUBLIC_SUPABASE_*` env vars from step 2
(not the service role key — Vercel never needs it) → Deploy.

## Project structure

```
src/
  app/
    login/                    sign-in page (no public sign-up)
    (app)/                    authenticated shell: bottom nav + FAB
      dashboard/               net worth, filters, summary, goals preview
      transactions/            searchable ledger, new/edit forms
      accounts/                balances, transfer flow
      goals/                   progress bars, scenario planner
      investments/             LIC/MF/PPF/stocks/FD tracking
      more/                    settings: members, categories, recurring,
                                assets, liabilities, budgets, currencies,
                                receipts, grocery insights, shopping list,
                                export, theme
      shopping/                companion grocery/shopping tracker
  components/                  shared UI + entity forms
  lib/
    finance/                   pure business-logic modules (see below)
    supabase/                  browser/server/middleware clients + queries
    actions/                   Next.js Server Actions (all writes)
supabase/
  migrations/                  schema, RLS, auth-link trigger — run in order
  seed/                        generated seed SQL (git-ignored)
scripts/
  generate-seed-sql.mjs        JSON exports -> seed.sql (no deps, no network)
  import.mjs                   JSON exports -> Supabase directly (needs network)
```

## Business logic modules (`src/lib/finance/`)

- `currency.ts` — convert-to-base at display time only; original
  amount/currency is never overwritten.
- `transfers.ts` — transfers excluded from every income/expense total.
- `salary.ts` — salary income bucketed into `date + 1 month` for
  dashboard/budget views, without touching the stored `date`.
- `recurring.ts` — monthly-normalizes by frequency; income excluded from
  the "commitment" total; never feeds real transaction totals.
- `goals.ts` — the four goal formulas + scenario planner, verbatim from spec.
- `networth.ts` — assets + investments − liabilities, converted to base.
- `dashboard.ts` — the three combinable filters (Period / Person / Category)
  plus summary, top-categories, and 6-month trend aggregation.
- `categorize.ts` / `transferMatching.ts` — keyword + historical-merchant
  categorization and transfer-matching for re-importing future statements.
- `receiptMatch.ts` — attach-to-existing-transaction matching for scanned
  receipts.
- `groceryInsights.ts` — frequently-bought items and spend-by-store,
  pooling both itemized bank transactions and the companion tracker.

## A note on the sandbox this was built in

This project was scaffolded in an environment with no access to npm's
registry or to Supabase/Vercel directly — only to GitHub. That's why the
initial data import ships as generated SQL rather than a live script run:
`generate-seed-sql.mjs` needed no network at all, so it could run right
here and hand you a paste-ready file. `import.mjs` is the equivalent tool
for anywhere with real network access (your machine, CI) if you need to
re-import updated exports later.
