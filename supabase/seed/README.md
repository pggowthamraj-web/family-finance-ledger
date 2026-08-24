# Seed data

`seed.sql` in this folder is generated from your two data exports by
`scripts/generate-seed-sql.mjs`. It contains real account balances and
transaction history, so it is **git-ignored on purpose** — it never gets
pushed to GitHub, even if the repo is private.

## Regenerating it

```
node scripts/generate-seed-sql.mjs \
  /path/to/family-finance-data-export.json \
  /path/to/shopping-tracker-data-export.json \
  gowtham@email.com \
  sanjana@email.com
```

The two email arguments are optional — they get baked into the `members`
rows so the auth-link trigger (`0003_auth_link.sql`) can match each Supabase
Auth account to the right member automatically. You can also leave them out
and set `members.email` later from the Settings screen or SQL editor.

## Running it

In the Supabase dashboard: **SQL Editor → New query**, paste the contents of
`seed.sql`, run once. Run the three migration files first, in order:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_auth_link.sql`
4. `supabase/seed/seed.sql`

The whole seed file is wrapped in a single transaction, so a failure rolls
back cleanly and nothing is left half-imported.
