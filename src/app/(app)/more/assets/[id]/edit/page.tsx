import { notFound } from 'next/navigation';
import { getHouseholdData } from '@/lib/supabase/queries';
import { updateAsset, deleteAsset } from '@/lib/actions/entities';
import { AssetForm } from '@/components/AssetForm';
import { PageHeader } from '@/components/PageHeader';

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getHouseholdData();
  if (!data) return null;
  const existing = data.assets.find((a) => a.id === id);
  if (!existing) notFound();

  return (
    <div>
      <PageHeader title="Edit asset" backHref="/more/assets" />
      <AssetForm action={updateAsset.bind(null, id)} members={data.members} baseCurrency={data.household.base_currency} existing={existing} />
      <form action={deleteAsset.bind(null, id)} className="mt-3">
        <button className="w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500">Delete asset</button>
      </form>
    </div>
  );
}
