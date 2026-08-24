import { getHouseholdData } from '@/lib/supabase/queries';
import { createGoal } from '@/lib/actions/goals';
import { GoalForm } from '@/components/GoalForm';
import { PageHeader } from '@/components/PageHeader';

export default async function NewGoalPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  return (
    <div>
      <PageHeader title="New goal" backHref="/goals" />
      <GoalForm action={createGoal} members={data.members} accounts={data.accounts} baseCurrency={data.household.base_currency} />
    </div>
  );
}
