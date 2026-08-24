import { getHouseholdData } from '@/lib/supabase/queries';
import { transferBetweenAccounts } from '@/lib/actions/accounts';
import { PageHeader } from '@/components/PageHeader';
import { CURRENCIES } from '@/lib/finance/currency';

export default async function TransferPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const { accounts, members, household } = data;

  return (
    <div>
      <PageHeader title="Transfer" backHref="/accounts" />
      <form action={transferBetweenAccounts} className="space-y-4">
        <Field label="From account">
          <select name="account_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select account
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="To account">
          <select name="to_account_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select account
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2">
          <Field label="Amount" className="flex-[2]">
            <input type="number" step="0.01" min="0" name="amount" required className={inputClass} />
          </Field>
          <Field label="Currency" className="flex-1">
            <select name="currency" defaultValue={household.base_currency} className={inputClass}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Date">
          <input type="date" name="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} />
        </Field>
        <Field label="Person">
          <select name="person_id" className={inputClass}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes">
          <input name="notes" className={inputClass} placeholder="e.g. Credit card payment" />
        </Field>
        <p className="text-xs text-teal-900/50">
          Transfers never count toward income or expense totals — see PROJECT_SPEC rule on double-counted transfers.
        </p>
        <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
          Transfer
        </button>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2.5 text-sm text-teal-900 outline-none focus:border-teal-600';

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1 block text-xs font-medium text-teal-900/70">{label}</span>
      {children}
    </label>
  );
}
