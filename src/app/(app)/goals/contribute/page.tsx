import { getHouseholdData } from '@/lib/supabase/queries';
import { addGoalContributionForm } from '@/lib/actions/goals';
import { PageHeader } from '@/components/PageHeader';

export default async function ContributePage() {
  const data = await getHouseholdData();
  if (!data) return null;

  return (
    <div>
      <PageHeader title="Goal contribution" backHref="/goals" />
      <form action={addGoalContributionForm} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-teal-900/70">Goal</span>
          <select name="goal_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select goal
            </option>
            {data.goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-teal-900/70">Amount</span>
          <input type="number" step="0.01" name="amount" required className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-teal-900/70">Date</span>
          <input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} />
        </label>
        <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
          Add contribution
        </button>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2.5 text-sm text-teal-900 outline-none focus:border-teal-600';
