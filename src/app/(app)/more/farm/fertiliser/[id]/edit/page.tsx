import { notFound } from 'next/navigation';
import { getFarmData } from '@/lib/supabase/queries';
import { updateFarmFertilizerApplication, deleteFarmFertilizerApplication } from '@/lib/actions/farm';
import { FertilizerForm } from '@/components/FertilizerForm';
import { PageHeader } from '@/components/PageHeader';

export default async function EditFertilizerApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getFarmData();
  if (!data) return null;
  const existing = data.fertilizerApplications.find((f) => f.id === id);
  if (!existing) notFound();

  return (
    <div>
      <PageHeader title="Edit fertiliser application" backHref="/more/farm/fertiliser" />
      <FertilizerForm action={updateFarmFertilizerApplication.bind(null, id)} existing={existing} />
      <form action={deleteFarmFertilizerApplication.bind(null, id)} className="mt-3">
        <button className="w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500">
          Delete application
        </button>
      </form>
    </div>
  );
}
