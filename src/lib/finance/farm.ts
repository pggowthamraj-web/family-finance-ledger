import type { FarmFertilizerApplication, FarmHarvest } from './types';
import { convertToBase } from './currency';

/** Gross coconut sale revenue for one harvest, before labour/watchman costs. */
export function harvestRevenue(h: Pick<FarmHarvest, 'small_coconuts_count' | 'small_coconut_price' | 'big_coconuts_count' | 'big_coconut_price'>): number {
  return h.small_coconuts_count * h.small_coconut_price + h.big_coconuts_count * h.big_coconut_price;
}

/** Net income for one harvest: coconut sale revenue minus labour and watchman costs. */
export function harvestIncome(
  h: Pick<
    FarmHarvest,
    'small_coconuts_count' | 'small_coconut_price' | 'big_coconuts_count' | 'big_coconut_price' | 'labour_charges' | 'watchman_salary'
  >
): number {
  return harvestRevenue(h) - h.labour_charges - h.watchman_salary;
}

/** Total cost for one fertiliser/manure application: per-tree rates x tree count. */
export function fertilizerApplicationCost(
  f: Pick<FarmFertilizerApplication, 'trees_count' | 'fertilizer_cost_per_tree' | 'labour_cost_per_tree'>
): number {
  return f.trees_count * (f.fertilizer_cost_per_tree + f.labour_cost_per_tree);
}

export interface FarmSummary {
  totalRevenue: number;
  totalHarvestCosts: number;
  totalHarvestIncome: number;
  totalFertilizerCost: number;
  net: number;
  harvestCount: number;
  fertilizerApplicationCount: number;
  lastHarvestDate: string | null;
}

/** Household-wide farm summary, all figures converted to base currency. */
export function farmSummary(
  harvests: FarmHarvest[],
  fertilizerApplications: FarmFertilizerApplication[],
  baseRates: Record<string, number>
): FarmSummary {
  let totalRevenue = 0;
  let totalHarvestCosts = 0;
  let totalHarvestIncome = 0;
  let lastHarvestDate: string | null = null;

  for (const h of harvests) {
    const revenue = convertToBase(harvestRevenue(h), h.currency, baseRates);
    const costs = convertToBase(h.labour_charges + h.watchman_salary, h.currency, baseRates);
    totalRevenue += revenue;
    totalHarvestCosts += costs;
    totalHarvestIncome += revenue - costs;
    if (!lastHarvestDate || h.harvest_date > lastHarvestDate) lastHarvestDate = h.harvest_date;
  }

  const totalFertilizerCost = fertilizerApplications.reduce(
    (sum, f) => sum + convertToBase(fertilizerApplicationCost(f), f.currency, baseRates),
    0
  );

  return {
    totalRevenue,
    totalHarvestCosts,
    totalHarvestIncome,
    totalFertilizerCost,
    net: totalHarvestIncome - totalFertilizerCost,
    harvestCount: harvests.length,
    fertilizerApplicationCount: fertilizerApplications.length,
    lastHarvestDate,
  };
}
