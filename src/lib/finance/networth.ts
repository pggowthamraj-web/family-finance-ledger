import type { Asset, Investment, Liability } from './types';
import { convertToBase } from './currency';

/**
 * PROJECT_SPEC: net_worth = sum(assets.current_value) + sum(investments.current_value)
 *   - sum(liabilities.current_amount), each converted to base currency.
 */
export function calculateNetWorth(
  assets: Pick<Asset, 'current_value' | 'currency'>[],
  investments: Pick<Investment, 'current_value' | 'currency'>[],
  liabilities: Pick<Liability, 'current_amount' | 'currency'>[],
  rates: Record<string, number>
): { netWorth: number; totalAssets: number; totalInvestments: number; totalLiabilities: number } {
  const totalAssets = assets.reduce((sum, a) => sum + convertToBase(a.current_value, a.currency, rates), 0);
  const totalInvestments = investments.reduce(
    (sum, i) => sum + convertToBase(i.current_value, i.currency, rates),
    0
  );
  const totalLiabilities = liabilities.reduce(
    (sum, l) => sum + convertToBase(l.current_amount, l.currency, rates),
    0
  );
  return {
    netWorth: totalAssets + totalInvestments - totalLiabilities,
    totalAssets,
    totalInvestments,
    totalLiabilities,
  };
}
