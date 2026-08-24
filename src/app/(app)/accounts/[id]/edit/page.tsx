import { notFound } from 'next/navigation';
import { getHouseholdData } from '@/lib/supabase/queries';
import { updateAccount, deleteAccount } from '@/lib/actions/accounts';
import { AccountForm } from '@/components/AccountForm';
import { PageHeader } from '@/components/PageHeader';

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getHouseholdData();
  if (!data) return null;
  const existing = data.accounts.find((a) => a.id === id);
  if (!existing) notFound();

  return (
    <div>
      <PageHeader title="Edit account" backHref="/accounts" />
      <AccountForm action={updateAccount.bind(null, id)} members={data.members} baseCurrency={data.household.base_currency} existing={existing} />
      <form action={deleteAccount.bind(null, id)} className="mt-3">
        <button className="w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500">Delete account</button>
      </form>
    </div>
  );
}
