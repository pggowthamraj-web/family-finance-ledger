import { notFound } from 'next/navigation';
import { getHouseholdData } from '@/lib/supabase/queries';
import { updateRecurring, deleteRecurring } from '@/lib/actions/entities';
import { RecurringForm } from '@/components/RecurringForm';
import { PageHeader } from '@/components/PageHeader';

export default async function EditRecurringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getHouseholdData();
  if (!data) return null;
  const existing = data.recurringTransactions.find((r) => r.id === id);
  if (!existing) notFound();

  return (
    <div>
      <PageHeader title="Edit recurring item" backHref="/more/recurring" />
      <RecurringForm
        action={updateRecurring.bind(null, id)}
        categories={data.categories}
        accounts={data.accounts}
        members={data.members}
        baseCurrency={data.household.base_currency}
        existing={existing}
      />
      <form action={deleteRecurring.bind(null, id)} className="mt-3">
        <button className="w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500">
          Delete recurring item
        </button>
      </form>
    </div>
  );
}
