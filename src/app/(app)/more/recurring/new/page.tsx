import { getHouseholdData } from '@/lib/supabase/queries';
import { createRecurring } from '@/lib/actions/entities';
import { RecurringForm } from '@/components/RecurringForm';
import { PageHeader } from '@/components/PageHeader';

export default async function NewRecurringPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  return (
    <div>
      <PageHeader title="New recurring item" backHref="/more/recurring" />
      <RecurringForm
        action={createRecurring}
        categories={data.categories}
        accounts={data.accounts}
        members={data.members}
        baseCurrency={data.household.base_currency}
      />
    </div>
  );
}
