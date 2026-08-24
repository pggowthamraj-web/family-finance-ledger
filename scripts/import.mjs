#!/usr/bin/env node
// One-time (or re-runnable) importer: loads the two data exports straight
// into Supabase via the service-role key. Every insert uses `upsert` keyed
// on the export's original id, so re-running after a fresh statement pull is
// safe and won't create duplicates.
//
// Requires network access to your Supabase project, so run this from your
// own machine (or CI) — not from a locked-down sandbox.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/import.mjs <finance-export.json> <shopping-export.json> [gowtham-email] [sanjana-email]
//
// (`npm run import:data` reads the same vars from .env.local automatically.)

import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const [, , financePath, shoppingPath, gowthamEmail, sanjanaEmail] = process.argv;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role, not anon) before running.');
  process.exit(1);
}
if (!financePath || !shoppingPath) {
  console.error('Usage: node scripts/import.mjs <finance-export.json> <shopping-export.json> [gowtham-email] [sanjana-email]');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const finance = JSON.parse(fs.readFileSync(financePath, 'utf8'));
const shopping = JSON.parse(fs.readFileSync(shoppingPath, 'utf8'));

const HOUSEHOLD_ID = 'hh_main';
const derivedRe = /derived|placeholder/i;
const unconfirmedRe =
  /unconfirmed|please confirm|worth (checking|double-checking)|not matched|could overlap|not found in (either|any) statement/i;
const categoryIdMap = {
  Salary: 'cat_salary',
  'Investment Income': 'cat_investment_income',
  Other: 'cat_other',
};
const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const dateOrNull = (v) => (v ? v : null);
const iso = (ms) => (ms ? new Date(Number(ms)).toISOString() : new Date().toISOString());

async function upsert(table, rows, label) {
  if (!rows.length) return;
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'id' });
    if (error) throw new Error(`${label} upsert failed at row ${i}: ${error.message}`);
  }
  console.log(`  ${label}: ${rows.length} rows`);
}

async function main() {
  console.log('Importing into', SUPABASE_URL);

  await upsert(
    'households',
    [
      {
        id: HOUSEHOLD_ID,
        name: 'Family',
        base_currency: finance.baseCurrency || 'GBP',
        exchange_rates: finance.exchangeRates,
      },
    ],
    'households'
  );

  const emailByMemberId = { m_gowtham: gowthamEmail || null, m_sanjana: sanjanaEmail || null };
  await upsert(
    'members',
    finance.members.map((m) => ({
      id: m.id,
      household_id: HOUSEHOLD_ID,
      email: emailByMemberId[m.id] || null,
      name: m.name,
      role: m.role || null,
      color: m.color || null,
    })),
    'members'
  );

  const categoryRows = finance.categories.map((c, idx) => ({
    id: c.id,
    household_id: HOUSEHOLD_ID,
    name: c.name,
    icon: c.icon || null,
    sort_order: idx,
  }));
  categoryRows.push(
    { id: 'cat_salary', household_id: HOUSEHOLD_ID, name: 'Salary', icon: 'Wallet', sort_order: categoryRows.length },
    {
      id: 'cat_investment_income',
      household_id: HOUSEHOLD_ID,
      name: 'Investment Income',
      icon: 'TrendingUp',
      sort_order: categoryRows.length + 1,
    }
  );
  await upsert('categories', categoryRows, 'categories');

  const subcategoryRows = finance.categories.flatMap((c) =>
    (c.subcategories || []).map((s) => ({ id: s.id, category_id: c.id, name: s.name }))
  );
  await upsert('subcategories', subcategoryRows, 'subcategories');

  await upsert(
    'accounts',
    finance.accounts.map((a) => ({
      id: a.id,
      household_id: HOUSEHOLD_ID,
      name: a.name,
      type: a.type,
      currency: a.currency,
      balance: num(a.balance),
      owner_id: a.ownerId || null,
      country: a.country || null,
      notes: a.notes || null,
      is_derived_placeholder: derivedRe.test(a.notes || ''),
    })),
    'accounts'
  );

  await upsert(
    'transactions',
    finance.transactions.map((t) => ({
      id: t.id,
      household_id: HOUSEHOLD_ID,
      type: t.type,
      date: t.date,
      amount: num(t.amount),
      currency: t.currency,
      category_id: categoryIdMap[t.categoryId] || t.categoryId || null,
      subcategory_id: t.subcategoryId || null,
      description: t.description || null,
      person_id: t.personId || null,
      entered_by_id: t.enteredById || null,
      account_id: t.accountId,
      to_account_id: t.toAccountId || null,
      recurring: !!t.recurring,
      notes: t.notes || null,
      country: t.country || null,
      items: t.items || null,
      created_at: iso(t.createdAt),
      updated_at: iso(t.updatedAt),
      created_by: t.createdBy || null,
      updated_by: t.updatedBy || null,
    })),
    'transactions'
  );

  await upsert(
    'recurring_transactions',
    finance.recurringTransactions.map((r) => ({
      id: r.id,
      household_id: HOUSEHOLD_ID,
      description: r.description,
      amount: num(r.amount),
      currency: r.currency,
      category_id: r.categoryId || null,
      subcategory_id: r.subcategoryId || null,
      frequency: r.frequency,
      account_id: r.accountId || null,
      person_id: r.personId || null,
      active: r.active !== false,
      type: r.type,
      notes: r.notes || null,
      start_date: dateOrNull(r.startDate),
      end_date: dateOrNull(r.endDate),
    })),
    'recurring_transactions'
  );

  await upsert(
    'assets',
    finance.assets.map((a) => ({
      id: a.id,
      household_id: HOUSEHOLD_ID,
      name: a.name,
      type: a.type,
      owner_id: a.ownerId || null,
      purchase_date: dateOrNull(a.purchaseDate),
      purchase_value: num(a.purchaseValue),
      current_value: num(a.currentValue),
      currency: a.currency,
      country: a.country || null,
      notes: a.notes || null,
      valuation_history: a.valuationHistory || [],
    })),
    'assets'
  );

  await upsert(
    'investments',
    finance.investments.map((i) => ({
      id: i.id,
      household_id: HOUSEHOLD_ID,
      type: i.type,
      name: i.name,
      provider: i.provider || null,
      owner_id: i.ownerId || null,
      currency: i.currency,
      invested_amount: num(i.investedAmount),
      current_value: num(i.currentValue),
      start_date: dateOrNull(i.startDate),
      maturity_date: dateOrNull(i.maturityDate),
      maturity_amount: num(i.maturityAmount),
      premium_amount: num(i.premiumAmount),
      premium_frequency: i.premiumFrequency || null,
      folio_number: i.folioNumber || null,
      notes: i.notes || null,
    })),
    'investments'
  );

  await upsert(
    'liabilities',
    finance.liabilities.map((l) => ({
      id: l.id,
      household_id: HOUSEHOLD_ID,
      name: l.name,
      type: l.type,
      original_amount: num(l.originalAmount),
      current_amount: num(l.currentAmount),
      currency: l.currency,
      interest_rate: num(l.interestRate),
      monthly_payment: num(l.monthlyPayment),
      start_date: dateOrNull(l.startDate),
      expected_end_date: dateOrNull(l.expectedEndDate),
      account_id: l.accountId || null,
      person_id: l.personId || null,
      notes: l.notes || null,
      is_unconfirmed: unconfirmedRe.test(l.notes || ''),
    })),
    'liabilities'
  );

  await upsert(
    'goals',
    finance.goals.map((g) => ({
      id: g.id,
      household_id: HOUSEHOLD_ID,
      name: g.name,
      description: g.description || null,
      target_amount: num(g.targetAmount),
      currency: g.currency,
      target_date: dateOrNull(g.targetDate),
      current_amount: num(g.currentAmount),
      monthly_contribution: num(g.monthlyContribution),
      account_id: g.accountId || null,
      priority: g.priority || null,
      owner_id: g.ownerId || null,
      notes: g.notes || null,
      contributions: g.contributions || [],
    })),
    'goals'
  );

  if (finance.budgets?.length) {
    await upsert(
      'budgets',
      finance.budgets.map((b) => ({
        id: b.id,
        household_id: HOUSEHOLD_ID,
        category_id: b.categoryId || null,
        person_id: b.personId || null,
        amount: num(b.amount),
        currency: b.currency,
        period: b.period || 'monthly',
      })),
      'budgets'
    );
  }

  if (finance.shoppingList?.length) {
    await upsert(
      'shopping_list',
      finance.shoppingList.map((s) => ({
        id: s.id,
        household_id: HOUSEHOLD_ID,
        name: s.name,
        checked: !!s.checked,
      })),
      'shopping_list (finance)'
    );
  }

  await upsert(
    'shopping_categories',
    shopping.categories.map((c) => ({ id: c.id, household_id: HOUSEHOLD_ID, name: c.name })),
    'shopping_categories'
  );

  await upsert(
    'shopping_trips',
    shopping.trips.map((t) => ({
      id: t.id,
      household_id: HOUSEHOLD_ID,
      store: t.store,
      date: t.date,
      currency: t.currency,
      notes: t.notes || null,
      created_at: iso(t.createdAt),
    })),
    'shopping_trips'
  );

  await upsert(
    'shopping_items',
    shopping.items.map((i) => ({
      id: i.id,
      trip_id: i.tripId,
      name: i.name,
      quantity: num(i.quantity),
      price: num(i.price),
      category_id: i.categoryId || null,
    })),
    'shopping_items'
  );

  console.log('Import complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
