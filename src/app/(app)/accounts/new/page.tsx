import { getHouseholdData } from '@/lib/supabase/queries';
import { createAccount } from '@/lib/actions/accounts';
import { AccountForm } from '@/components/AccountForm';
import { PageHeader } from '@/components/PageHeader';

export default async function NewAccountPage() {
  const data = await getHouseholdData();
  if (!data) return null;

  return (
    <div>
      <PageHeader title="New account" backHref="/accounts" />
      <AccountForm action={createAccount} members={data.members} baseCurrency={data.household.base_currency} />
    </div>
  );
}
