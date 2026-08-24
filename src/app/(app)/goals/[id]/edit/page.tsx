import { notFound } from 'next/navigation';
import { getHouseholdData } from '@/lib/supabase/queries';
import { updateGoal, deleteGoal } from '@/lib/actions/goals';
import { GoalForm } from '@/components/GoalForm';
import { PageHeader } from '@/components/PageHeader';

export default async function EditGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getHouseholdData();
  if (!data) return null;
  const existing = data.goals.find((g) => g.id === id);
  if (!existing) notFound();

  return (
    <div>
      <PageHeader title="Edit goal" backHref="/goals" />
      <GoalForm
        action={updateGoal.bind(null, id)}
        members={data.members}
        accounts={data.accounts}
        baseCurrency={data.household.base_currency}
        existing={existing}
      />
      <form action={deleteGoal.bind(null, id)} className="mt-3">
        <button className="w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500">Delete goal</button>
      </form>
    </div>
  );
}
