import type { Transaction } from './types';
import { convertToBase } from './currency';
import { displayPeriodBucket, monthKey } from './salary';
import { excludeTransfers } from './transfers';

/**
 * PROJECT_SPEC "Dashboard filtering": three independent, combinable filters
 * — Period (Month / Year / Financial Year [Apr-Mar] / All Time), Person, and
 * Category.
 */
export type PeriodFilter =
  | { kind: 'month'; year: number; month: number } // month: 1-12
  | { kind: 'year'; year: number }
  | { kind: 'financial-year'; fyStartYear: number } // Apr fyStartYear -> Mar fyStartYear+1
  | { kind: 'all' };

export interface DashboardFilters {
  period: PeriodFilter;
  personId?: string | null;
  categoryId?: string | null;
}

function bucketToComparable(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function periodContainsBucket(period: PeriodFilter, year: number, month: number): boolean {
  const bucket = bucketToComparable(year, month);
  switch (period.kind) {
    case 'all':
      return true;
    case 'year':
      return year === period.year;
    case 'month':
      return bucket === bucketToComparable(period.year, period.month);
    case 'financial-year': {
      const start = bucketToComparable(period.fyStartYear, 4); // April
      const end = bucketToComparable(period.fyStartYear + 1, 3); // March
      return bucket >= start && bucket <= end;
    }
  }
}

/**
 * Applies all three filters. Period matching uses the *display* bucket
 * (salary income shifted +1 month per PROJECT_SPEC rule #3) — this is the
 * dashboard/budgeting view, not the raw ledger.
 */
export function filterForDashboard(transactions: Transaction[], filters: DashboardFilters): Transaction[] {
  return transactions.filter((t) => {
    if (filters.personId && t.person_id !== filters.personId) return false;
    if (filters.categoryId && t.category_id !== filters.categoryId) return false;
    const bucket = displayPeriodBucket(t);
    const [y, m] = bucket.split('-').map(Number);
    return periodContainsBucket(filters.period, y, m);
  });
}

export interface DashboardSummary {
  income: number;
  expense: number;
  cashFlow: number;
  savingsRate: number; // percent, 0 when income is 0
}

/** Income/expense/cash-flow/savings cards. Transfers are always excluded. */
export function computeSummary(transactions: Transaction[], rates: Record<string, number>): DashboardSummary {
  const real = excludeTransfers(transactions);
  let income = 0;
  let expense = 0;
  for (const t of real) {
    const base = convertToBase(t.amount, t.currency, rates);
    if (t.type === 'income') income += base;
    else if (t.type === 'expense') expense += base;
  }
  const cashFlow = income - expense;
  const savingsRate = income > 0 ? (cashFlow / income) * 100 : 0;
  return { income, expense, cashFlow, savingsRate };
}

export interface CategoryTotal {
  categoryId: string;
  total: number;
}

export function topCategories(
  transactions: Transaction[],
  rates: Record<string, number>,
  limit = 5
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const t of excludeTransfers(transactions)) {
    if (t.type !== 'expense' || !t.category_id) continue;
    const base = convertToBase(t.amount, t.currency, rates);
    totals.set(t.category_id, (totals.get(t.category_id) ?? 0) + base);
  }
  return [...totals.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/** Per-person breakdown for a single category (used by the category detail view). */
export function categoryByPerson(
  transactions: Transaction[],
  categoryId: string,
  rates: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of excludeTransfers(transactions)) {
    if (t.type !== 'expense' || t.category_id !== categoryId) continue;
    const key = t.person_id ?? 'unassigned';
    out[key] = (out[key] ?? 0) + convertToBase(t.amount, t.currency, rates);
  }
  return out;
}

export interface TrendPoint {
  month: string; // YYYY-MM
  total: number;
}

/**
 * 6-month trend for a category, ending at `endYear`/`endMonth` (defaults to
 * the current month). Used to replace the default top-5 list when a
 * category filter is active.
 */
export function categoryTrend(
  allTransactions: Transaction[],
  categoryId: string,
  rates: Record<string, number>,
  monthsBack = 6,
  end: { year: number; month: number } = (() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  })()
): TrendPoint[] {
  const endBucket = bucketToComparable(end.year, end.month);
  const points: TrendPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const bucket = endBucket - i;
    const year = Math.floor(bucket / 12);
    const month = (bucket % 12) + 1;
    points.push({ month: monthKey(year, month), total: 0 });
  }
  const indexByMonth = new Map(points.map((p, idx) => [p.month, idx]));

  for (const t of excludeTransfers(allTransactions)) {
    if (t.type !== 'expense' || t.category_id !== categoryId) continue;
    const bucket = displayPeriodBucket(t);
    const idx = indexByMonth.get(bucket);
    if (idx === undefined) continue;
    points[idx].total += convertToBase(t.amount, t.currency, rates);
  }

  return points;
}
