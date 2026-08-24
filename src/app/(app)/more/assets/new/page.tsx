import { getHouseholdData } from '@/lib/supabase/queries';
import { createAsset } from '@/lib/actions/entities';
import { AssetForm } from '@/components/AssetForm';
import { PageHeader } from '@/components/PageHeader';

export default async function NewAssetPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  return (
    <div>
      <PageHeader title="New asset" backHref="/more/assets" />
      <AssetForm action={createAsset} members={data.members} baseCurrency={data.household.base_currency} />
    </div>
  );
}
