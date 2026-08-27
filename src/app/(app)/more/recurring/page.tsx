import { getHouseholdData } from '@/lib/supabase/queries';
import { createRecurring, deleteRecurring, updateRecurring } from '@/lib/actions/entities';
import { recurringMonthlyCommitment, monthlyNormalizedAmount, isRecurringCurrentlyInWindow } from '@/lib/finance/recurring';
import { PageHeader } from '@/components/PageHeader';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { CURRENCIES } from '@/lib/finance/currency';

const FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'];

export default async function RecurringPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const { recurringTransactions, categories, accounts, members, household } = data;

  const today = new Date().toISOString().slice(0, 10);
  const commitment = recurringMonthlyCommitment(recurringTransactions, household.exchange_rates, { today });

  return (
    <div>
      <PageHeader title="Recurring Transactions" backHref="/more" />

      <Card className="mb-4">
        <p className="text-xs font-medium text-teal-900/50">Monthly commitment (expenses only)</p>
        <Money amount={commitment} currency={household.base_currency} className="text-2xl" />
        <p className="mt-1 text-xs text-teal-900/40">
          Informational only — normalized by frequency, never counted in actual transaction totals. Only active items
          within their start/end date window count toward this figure.
        </p>
      </Card>

      <div className="space-y-2">
        {recurringTransactions.map((r) => {
          const inWindow = isRecurringCurrentlyInWindow(r, today);
          const statusHint =
            r.active && !inWindow
              ? r.start_date && today < r.start_date
                ? `Starts ${r.start_date} — not yet counted in the total`
                : r.end_date && today > r.end_date
                  ? `Ended ${r.end_date} — no longer counted in the total`
                  : null
              : null;

          return (
            <Card key={r.id}>
              <form action={updateRecurring.bind(null, r.id)} className="space-y-2">
                <input name="description" defaultValue={r.description} required placeholder="Description" className={inputClass} />
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    defaultValue={r.amount}
                    required
                    placeholder="Amount"
                    className={inputClass}
                  />
                  <select name="currency" defaultValue={r.currency} className={inputClass}>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <select name="type" defaultValue={r.type} className={inputClass}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  <select name="frequency" defaultValue={r.frequency} className={inputClass}>
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <select name="category_id" defaultValue={r.category_id ?? ''} className={inputClass}>
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <select name="account_id" defaultValue={r.account_id ?? ''} className={inputClass}>
                    <option value="">No account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <select name="person_id" defaultValue={r.person_id ?? ''} className={inputClass}>
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <span className="mb-1 block text-xs font-medium text-teal-900/50">Start date</span>
                    <input type="date" name="start_date" defaultValue={r.start_date ?? ''} className={inputClass} />
                  </label>
                  <label className="flex-1">
                    <span className="mb-1 block text-xs font-medium text-teal-900/50">End date</span>
                    <input type="date" name="end_date" defaultValue={r.end_date ?? ''} className={inputClass} />
                  </label>
                </div>
                <input name="notes" defaultValue={r.notes ?? ''} placeholder="Notes" className={inputClass} />
                <label className="flex items-center gap-2 text-xs font-medium text-teal-900/70">
                  <input type="checkbox" name="active" defaultChecked={r.active} /> Active
                </label>
                {statusHint && <p className="text-[11px] text-amber-600">{statusHint}</p>}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] text-teal-900/40">
                    ≈ <Money amount={monthlyNormalizedAmount(r)} currency={r.currency} compact /> /mo
                  </p>
                  <button type="submit" className="rounded-lg bg-teal-900 px-4 py-1.5 text-xs font-medium text-white">
                    Save
                  </button>
                </div>
              </form>
              <form action={deleteRecurring.bind(null, r.id)} className="mt-2">
                <button className="text-xs font-medium text-rose-500">Delete</button>
              </form>
            </Card>
          );
        })}
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
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium text-teal-900/50">Start date</span>
              <input type="date" name="start_date" className={inputClass} />
            </label>
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium text-teal-900/50">End date</span>
              <input type="date" name="end_date" className={inputClass} />
            </label>
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
