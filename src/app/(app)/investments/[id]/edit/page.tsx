import { notFound } from 'next/navigation';
import { getHouseholdData } from '@/lib/supabase/queries';
import { updateInvestment, deleteInvestment } from '@/lib/actions/entities';
import { InvestmentForm } from '@/components/InvestmentForm';
import { PageHeader } from '@/components/PageHeader';

export default async function EditInvestmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getHouseholdData();
  if (!data) return null;
  const existing = data.investments.find((i) => i.id === id);
  if (!existing) notFound();

  return (
    <div>
      <PageHeader title="Edit investment" backHref="/investments" />
      <InvestmentForm action={updateInvestment.bind(null, id)} members={data.members} baseCurrency={data.household.base_currency} existing={existing} />
      <form action={deleteInvestment.bind(null, id)} className="mt-3">
        <button className="w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500">Delete investment</button>
      </form>
    </div>
  );
}
