import { notFound } from 'next/navigation';
import { getHouseholdData } from '@/lib/supabase/queries';
import { updateTransaction, deleteTransaction } from '@/lib/actions/transactions';
import { TransactionForm } from '@/components/TransactionForm';
import { PageHeader } from '@/components/PageHeader';

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getHouseholdData();
  if (!data) return null;

  const existing = data.transactions.find((t) => t.id === id);
  if (!existing) notFound();

  const updateWithId = updateTransaction.bind(null, id);
  const deleteWithId = deleteTransaction.bind(null, id);

  return (
    <div>
      <PageHeader title="Edit transaction" backHref="/transactions" />
      <TransactionForm
        action={updateWithId}
        accounts={data.accounts}
        categories={data.categories}
        subcategories={data.subcategories}
        members={data.members}
        baseCurrency={data.household.base_currency}
        existing={existing}
      />
      <form action={deleteWithId} className="mt-3">
        <button className="w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500">
          Delete transaction
        </button>
      </form>
    </div>
  );
}
