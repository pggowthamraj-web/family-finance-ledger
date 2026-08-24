import type { Transaction } from './types';

/**
 * PROJECT_SPEC rule #3: salary is credited at month-end but used to cover the
 * *following* month's expenses. Dashboards/budgeting views bucket
 * `type: income, category: Salary` transactions into `date + 1 month`
 * (first of next month) instead of the real credit date. The stored `date`
 * column is never touched — this only changes which period a transaction is
 * grouped into for display.
 *
 * Deliberately implemented as pure month-index arithmetic (not "add 30/31
 * days" or Date-object rollover) so day-of-month overflow can't happen:
 * Jan 31 + 1 month must bucket into Feb, never "Mar 3". Since bucketing only
 * needs a {year, month}, the day component is irrelevant and never touched.
 */
export function shiftMonthForward(dateStr: string): { year: number; month: number } {
  const [y, m] = dateStr.split('-').map(Number);
  let year = y;
  let month = m + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return { year, month };
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** The id used for the "Salary" category, created by the seed/import scripts. */
export const SALARY_CATEGORY_ID = 'cat_salary';

/**
 * The display-period bucket ("YYYY-MM") a transaction should be grouped
 * into on dashboard/budgeting views. Everything except salary income uses
 * its real transaction month; salary income is shifted forward one month.
 */
export function displayPeriodBucket(tx: Pick<Transaction, 'date' | 'type' | 'category_id'>): string {
  if (tx.type === 'income' && tx.category_id === SALARY_CATEGORY_ID) {
    const { year, month } = shiftMonthForward(tx.date);
    return monthKey(year, month);
  }
  return tx.date.slice(0, 7); // 'YYYY-MM' straight from the stored date
}
