import { getHouseholdData } from '@/lib/supabase/queries';
import { createLiability } from '@/lib/actions/entities';
import { LiabilityForm } from '@/components/LiabilityForm';
import { PageHeader } from '@/components/PageHeader';

export default async function NewLiabilityPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  return (
    <div>
      <PageHeader title="New liability" backHref="/more/liabilities" />
      <LiabilityForm action={createLiability} members={data.members} accounts={data.accounts} baseCurrency={data.household.base_currency} />
    </div>
  );
}
