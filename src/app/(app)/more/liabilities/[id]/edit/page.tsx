import { notFound } from 'next/navigation';
import { getHouseholdData } from '@/lib/supabase/queries';
import { updateLiability, deleteLiability } from '@/lib/actions/entities';
import { LiabilityForm } from '@/components/LiabilityForm';
import { PageHeader } from '@/components/PageHeader';

export default async function EditLiabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getHouseholdData();
  if (!data) return null;
  const existing = data.liabilities.find((l) => l.id === id);
  if (!existing) notFound();

  return (
    <div>
      <PageHeader title="Edit liability" backHref="/more/liabilities" />
      <LiabilityForm
        action={updateLiability.bind(null, id)}
        members={data.members}
        accounts={data.accounts}
        baseCurrency={data.household.base_currency}
        existing={existing}
      />
      <form action={deleteLiability.bind(null, id)} className="mt-3">
        <button className="w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500">Delete liability</button>
      </form>
    </div>
  );
}
