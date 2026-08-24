import { getHouseholdData } from '@/lib/supabase/queries';
import { TransactionsClient } from './TransactionsClient';

export default async function TransactionsPage() {
  const data = await getHouseholdData();
  if (!data) return null;

  return <TransactionsClient data={data} />;
}
