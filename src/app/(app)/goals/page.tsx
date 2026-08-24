import { getHouseholdData } from '@/lib/supabase/queries';
import { GoalsClient } from './GoalsClient';

export default async function GoalsPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  return <GoalsClient goals={data.goals} members={data.members} />;
}
