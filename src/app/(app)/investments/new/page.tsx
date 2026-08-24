import { getHouseholdData } from '@/lib/supabase/queries';
import { createInvestment } from '@/lib/actions/entities';
import { InvestmentForm } from '@/components/InvestmentForm';
import { PageHeader } from '@/components/PageHeader';

export default async function NewInvestmentPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  return (
    <div>
      <PageHeader title="New investment" backHref="/investments" />
      <InvestmentForm action={createInvestment} members={data.members} baseCurrency={data.household.base_currency} />
    </div>
  );
}
