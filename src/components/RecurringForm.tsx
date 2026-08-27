'use client';

import type { Account, Category, Member, RecurringTransaction } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';

const FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'];

export function RecurringForm({
  action,
  categories,
  accounts,
  members,
  baseCurrency,
  existing,
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: Category[];
  accounts: Account[];
  members: Member[];
  baseCurrency: string;
  existing?: RecurringTransaction;
}) {
  return (
    <form action={action} className="space-y-4">
      <Field label="Description">
        <input name="description" required defaultValue={existing?.description} className={inputClass} />
      </Field>
      <div className="flex gap-2">
        <Field label="Amount" className="flex-1">
          <input type="number" step="0.01" name="amount" required defaultValue={existing?.amount ?? 0} className={inputClass} />
        </Field>
        <Field label="Currency" className="flex-1">
          <select name="currency" defaultValue={existing?.currency ?? baseCurrency} className={inputClass}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="flex gap-2">
        <Field label="Type" className="flex-1">
          <select name="type" defaultValue={existing?.type ?? 'expense'} className={inputClass}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </Field>
        <Field label="Frequency" className="flex-1">
          <select name="frequency" defaultValue={existing?.frequency ?? 'monthly'} className={inputClass}>
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Category">
        <select name="category_id" defaultValue={existing?.category_id ?? ''} className={inputClass}>
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        <Field label="Account" className="flex-1">
          <select name="account_id" defaultValue={existing?.account_id ?? ''} className={inputClass}>
            <option value="">No account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Person" className="flex-1">
          <select name="person_id" defaultValue={existing?.person_id ?? ''} className={inputClass}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="flex gap-2">
        <Field label="Start date" className="flex-1">
          <input type="date" name="start_date" defaultValue={existing?.start_date ?? ''} className={inputClass} />
        </Field>
        <Field label="End date" className="flex-1">
          <input type="date" name="end_date" defaultValue={existing?.end_date ?? ''} className={inputClass} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea name="notes" rows={2} defaultValue={existing?.notes ?? ''} className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium text-teal-900">
        <input type="checkbox" name="active" defaultChecked={existing?.active ?? true} /> Active
      </label>
      <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
        {existing ? 'Save changes' : 'Add recurring item'}
      </button>
    </form>
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
