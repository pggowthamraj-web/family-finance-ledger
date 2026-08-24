import { getShoppingData } from '@/lib/supabase/queries';
import { getHouseholdData } from '@/lib/supabase/queries';
import { ShoppingClient } from './ShoppingClient';

export default async function ShoppingPage() {
  const [shopping, household] = await Promise.all([getShoppingData(), getHouseholdData()]);
  if (!shopping || !household) return null;

  return <ShoppingClient shopping={shopping} baseCurrency={household.household.base_currency} />;
}
