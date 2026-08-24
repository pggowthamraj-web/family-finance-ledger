import { getHouseholdData } from '@/lib/supabase/queries';
import { ReceiptsClient } from './ReceiptsClient';

export default async function ReceiptsPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  return <ReceiptsClient data={data} />;
}
