import { getHouseholdData } from '@/lib/supabase/queries';
import { createBudget, deleteBudget } from '@/lib/actions/entities';
import { convertToBase } from '@/lib/finance/currency';
import { excludeTransfers } from '@/lib/finance/transfers';
import { PageHeader } from '@/components/PageHeader';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CURRENCIES } from '@/lib/finance/currency';

export default async function BudgetsPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const { budgets, categories, members, transactions, household } = data;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';
  const memberName = (id: string | null) => members.find((m) => m.id === id)?.name ?? null;

  const spendByCategoryPerson = new Map<string, number>();
  for (const t of excludeTransfers(transactions)) {
    if (t.type !== 'expense' || !t.date.startsWith(thisMonth)) continue;
    const key = `${t.category_id ?? ''}::${t.person_id ?? ''}`;
    spendByCategoryPerson.set(key, (spendByCategoryPerson.get(key) ?? 0) + convertToBase(t.amount, t.currency, household.exchange_rates));
  }

  return (
    <div>
      <PageHeader title="Budgets" backHref="/more" />
      <div className="space-y-3">
        {budgets.map((b) => {
          const key = `${b.category_id ?? ''}::${b.person_id ?? ''}`;
          const spentBase = spendByCategoryPerson.get(key) ?? 0;
          const budgetBase = convertToBase(b.amount, b.currency, household.exchange_rates);
          const percent = budgetBase > 0 ? (spentBase / budgetBase) * 100 : 0;
          return (
            <Card key={b.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-teal-900">{categoryName(b.category_id)}</p>
                  <p className="text-xs text-teal-900/50">{memberName(b.person_id) ?? 'Whole household'} · this month</p>
                </div>
                <form action={deleteBudget.bind(null, b.id)}>
                  <button className="text-xs font-medium text-rose-500">Delete</button>
                </form>
              </div>
              <div className="mt-2">
                <ProgressBar percent={percent} tone={percent > 100 ? 'rose' : 'teal'} />
                <div className="mt-1 flex justify-between text-xs text-teal-900/50">
                  <Money amount={spentBase} currency={household.base_currency} compact />
                  <span>of</span>
                  <Money amount={budgetBase} currency={household.base_currency} compact />
                </div>
              </div>
            </Card>
          );
        })}
        {budgets.length === 0 && <p className="text-sm text-teal-900/50">No budgets set yet.</p>}
      </div>

      <Card className="mt-4">
        <SectionHeader title="Add budget" />
        <form action={createBudget} className="space-y-2">
          <select name="category_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="person_id" defaultValue="" className={inputClass}>
            <option value="">Whole household</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input type="number" step="0.01" name="amount" required placeholder="Monthly amount" className={inputClass} />
            <select name="currency" defaultValue={household.base_currency} className={inputClass}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-teal-900 py-2.5 text-sm font-medium text-white">
            Add budget
          </button>
        </form>
      </Card>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 text-sm text-teal-900';
