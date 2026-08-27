import { notFound } from 'next/navigation';
import { getFarmData } from '@/lib/supabase/queries';
import { updateFarmHarvest, deleteFarmHarvest } from '@/lib/actions/farm';
import { HarvestForm } from '@/components/HarvestForm';
import { PageHeader } from '@/components/PageHeader';

export default async function EditHarvestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getFarmData();
  if (!data) return null;
  const existing = data.harvests.find((h) => h.id === id);
  if (!existing) notFound();

  return (
    <div>
      <PageHeader title="Edit harvest" backHref="/more/farm/harvests" />
      <HarvestForm action={updateFarmHarvest.bind(null, id)} existing={existing} />
      <form action={deleteFarmHarvest.bind(null, id)} className="mt-3">
        <button className="w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500">Delete harvest</button>
      </form>
    </div>
  );
}
