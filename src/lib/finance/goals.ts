import type { Goal } from './types';

/**
 * Whole calendar months between two dates, ignoring day-of-month (e.g. any
 * day in March to any day in June is 3 months). Never negative for the
 * `months_remaining` use case below — callers that want a signed value
 * should not clamp themselves.
 */
export function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  );
}

export interface GoalProgress {
  remaining: number;
  monthsRemaining: number;
  requiredMonthly: number;
  percent: number;
}

/**
 * PROJECT_SPEC goal formulas, verbatim:
 *   remaining = max(0, target_amount - current_amount)
 *   months_remaining = max(0, months_between(today, target_date))
 *   required_monthly = months_remaining > 0 ? remaining / months_remaining : remaining
 *   percent = min(100, current_amount / target_amount * 100)
 */
export function goalProgress(goal: Pick<Goal, 'target_amount' | 'current_amount' | 'target_date'>, today: Date = new Date()): GoalProgress {
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const monthsRemaining = goal.target_date
    ? Math.max(0, monthsBetween(today, new Date(goal.target_date)))
    : 0;
  const requiredMonthly = monthsRemaining > 0 ? remaining / monthsRemaining : remaining;
  const percent = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
  return { remaining, monthsRemaining, requiredMonthly, percent };
}

/**
 * Scenario planner: given a hypothetical monthly contribution, how many
 * months until the goal completes? `months_to_complete = ceil(remaining / contribution)`.
 * Returns null when the contribution can never get there (<= 0 with remaining > 0).
 */
export function monthsToComplete(remaining: number, hypotheticalMonthlyContribution: number): number | null {
  if (remaining <= 0) return 0;
  if (hypotheticalMonthlyContribution <= 0) return null;
  return Math.ceil(remaining / hypotheticalMonthlyContribution);
}
