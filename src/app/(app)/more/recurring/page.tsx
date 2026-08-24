import { getHouseholdData } from '@/lib/supabase/queries';
import { createRecurring, deleteRecurring, updateRecurring } from '@/lib/actions/entities';
import { recurringMonthlyCommitment, monthlyNormalizedAmount } from '@/lib/finance/recurring';
import { PageHeader } from '@/components/PageHeader';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { CURRENCIES } from '@/lib/finance/currency';

const FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'];

export default async function RecurringPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const { recurringTransactions, categories, accounts, members, household } = data;

  const commitment = recurringMonthlyCommitment(recurringTransactions, household.exchange_rates);
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '—';

  return (
    <div>
      <PageHeader title="Recurring Transactions" backHref="/more" />

      <Card className="mb-4">
        <p className="text-xs font-medium text-teal-900/50">Monthly commitment (expenses only)</p>
        <Money amount={commitment} currency={household.base_currency} className="text-2xl" />
        <p className="mt-1 text-xs text-teal-900/40">
          Informational only — normalized by frequency, never counted in actual transaction totals.
        </p>
      </Card>

      <div className="space-y-2">
        {recurringTransactions.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-teal-900">{r.description}</p>
                <p className="text-xs text-teal-900/50">
                  {categoryName(r.category_id)} · {r.frequency}
                  {!r.active && ' · inactive'}
                </p>
              </div>
              <div className="text-right">
                <Money amount={r.amount} currency={r.currency} className={r.type === 'income' ? 'text-emerald-500' : 'text-rose-500'} />
                <p className="text-[10px] text-teal-900/40">
                  ≈ <Money amount={monthlyNormalizedAmount(r)} currency={r.currency} compact /> /mo
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <form action={updateRecurring.bind(null, r.id)}>
                <input type="hidden" name="description" value={r.description} />
                <input type="hidden" name="amount" value={r.amount} />
                <input type="hidden" name="currency" value={r.currency} />
                <input type="hidden" name="category_id" value={r.category_id ?? ''} />
                <input type="hidden" name="frequency" value={r.frequency} />
                <input type="hidden" name="account_id" value={r.account_id ?? ''} />
                <input type="hidden" name="person_id" value={r.person_id ?? ''} />
                <input type="hidden" name="type" value={r.type} />
                <input type="hidden" name="notes" value={r.notes ?? ''} />
                <input type="hidden" name="start_date" value={r.start_date ?? ''} />
                <input type="hidden" name="end_date" value={r.end_date ?? ''} />
                {r.active && <input type="hidden" name="active" value="" />}
                {!r.active && <input type="hidden" name="active" value="on" />}
                <button type="submit" className="text-xs font-medium text-teal-700">
                  {r.active ? 'Mark inactive' : 'Mark active'}
                </button>
              </form>
              <form action={deleteRecurring.bind(null, r.id)}>
                <button className="text-xs font-medium text-rose-500">Delete</button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <SectionHeader title="Add recurring item" />
        <form action={createRecurring} className="space-y-2">
          <input name="description" required placeholder="Description" className={inputClass} />
          <div className="flex gap-2">
            <input type="number" step="0.01" name="amount" required placeholder="Amount" className={inputClass} />
            <select name="currency" defaultValue={household.base_currency} className={inputClass}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <select name="type" defaultValue="expense" className={inputClass}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select name="frequency" defaultValue="monthly" className={inputClass}>
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <select name="category_id" defaultValue="" className={inputClass}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select name="account_id" defaultValue="" className={inputClass}>
              <option value="">No account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <select name="person_id" defaultValue="" className={inputClass}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-teal-900 py-2.5 text-sm font-medium text-white">
            Add
          </button>
        </form>
      </Card>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 text-sm text-teal-900';
