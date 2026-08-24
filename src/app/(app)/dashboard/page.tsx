import { getHouseholdData } from '@/lib/supabase/queries';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const data = await getHouseholdData();
  if (!data) return null;

  return <DashboardClient data={data} />;
}
