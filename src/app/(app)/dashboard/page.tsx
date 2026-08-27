import { getHouseholdData, getFarmData } from '@/lib/supabase/queries';
import { farmSummary } from '@/lib/finance/farm';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const data = await getHouseholdData();
  if (!data) return null;

  const farmData = await getFarmData();
  const farmIncome = farmData
    ? farmSummary(farmData.harvests, farmData.fertilizerApplications, data.household.exchange_rates)
    : null;

  return <DashboardClient data={data} farmIncome={farmIncome ? { amount: farmIncome.net, currency: farmIncome.currency } : null} />;
}
