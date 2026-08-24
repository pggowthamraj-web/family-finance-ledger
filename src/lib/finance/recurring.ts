import type { RecurringTransaction } from './types';
import { convertToBase } from './currency';

/**
 * PROJECT_SPEC: recurring_transactions are informational only — they never
 * feed the real transaction totals. They only roll into a separate
 * "recurring monthly commitment" figure, monthly-normalized by frequency,
 * and excluding `type: 'income'` (that figure means bills going out).
 */
const FREQUENCY_MONTHLY_MULTIPLIER: Record<string, number> = {
  weekly: 52 / 12,
  monthly: 1,
  quarterly: 4 / 12,
  'half-yearly': 2 / 12,
  yearly: 1 / 12,
  // Not specified by PROJECT_SPEC; treated as already-monthly (no scaling)
  // rather than silently dropped from the commitment total.
  custom: 1,
};

export function monthlyNormalizedAmount(r: Pick<RecurringTransaction, 'amount' | 'frequency'>): number {
  const multiplier = FREQUENCY_MONTHLY_MULTIPLIER[r.frequency] ?? 1;
  return r.amount * multiplier;
}

/**
 * Total recurring monthly commitment, in base currency. Only active,
 * expense-type recurring items count — income entries are excluded per spec.
 */
export function recurringMonthlyCommitment(
  recurring: RecurringTransaction[],
  baseRates: Record<string, number>,
  opts?: { activeOnly?: boolean }
): number {
  const activeOnly = opts?.activeOnly ?? true;
  return recurring
    .filter((r) => r.type === 'expense')
    .filter((r) => (activeOnly ? r.active : true))
    .reduce((sum, r) => sum + convertToBase(monthlyNormalizedAmount(r), r.currency, baseRates), 0);
}

/** Same figure but split out per category — for a "commitments by category" view. */
export function recurringMonthlyCommitmentByCategory(
  recurring: RecurringTransaction[],
  baseRates: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of recurring) {
    if (r.type !== 'expense' || !r.active) continue;
    const key = r.category_id ?? 'uncategorized';
    out[key] = (out[key] ?? 0) + convertToBase(monthlyNormalizedAmount(r), r.currency, baseRates);
  }
  return out;
}
