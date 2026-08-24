import { getHouseholdData } from '@/lib/supabase/queries';
import { createTransaction } from '@/lib/actions/transactions';
import { TransactionForm } from '@/components/TransactionForm';
import { PageHeader } from '@/components/PageHeader';
import type { TransactionType } from '@/lib/finance/types';

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const data = await getHouseholdData();
  if (!data) return null;

  return (
    <div>
      <PageHeader title="New transaction" backHref="/transactions" />
      <TransactionForm
        action={createTransaction}
        accounts={data.accounts}
        categories={data.categories}
        subcategories={data.subcategories}
        members={data.members}
        baseCurrency={data.household.base_currency}
        defaultType={(type as TransactionType) ?? 'expense'}
      />
    </div>
  );
}
