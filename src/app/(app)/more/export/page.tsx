import { getHouseholdData, getShoppingData } from '@/lib/supabase/queries';
import { ExportClient } from './ExportClient';

export default async function ExportPage() {
  const [household, shopping] = await Promise.all([getHouseholdData(), getShoppingData()]);
  if (!household || !shopping) return null;
  return <ExportClient household={household} shopping={shopping} />;
}
