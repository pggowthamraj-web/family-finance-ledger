'use client';

import type { Account, Liability, Member } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';

const TYPES = ['Mortgage', 'Car Loan', 'Personal Loan', 'Credit Card', 'Education Loan', 'Other'];

export function LiabilityForm({
  action,
  members,
  accounts,
  baseCurrency,
  existing,
}: {
  action: (formData: FormData) => void | Promise<void>;
  members: Member[];
  accounts: Account[];
  baseCurrency: string;
  existing?: Liability;
}) {
  return (
    <form action={action} className="space-y-4">
      <Field label="Name">
        <input name="name" required defaultValue={existing?.name} className={inputClass} />
      </Field>
      <Field label="Type">
        <select name="type" required defaultValue={existing?.type ?? 'Personal Loan'} className={inputClass}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        <Field label="Original amount" className="flex-1">
          <input type="number" step="0.01" name="original_amount" defaultValue={existing?.original_amount ?? 0} className={inputClass} />
        </Field>
        <Field label="Current amount" className="flex-1">
          <input type="number" step="0.01" name="current_amount" defaultValue={existing?.current_amount ?? 0} className={inputClass} />
        </Field>
      </div>
      <div className="flex gap-2">
        <Field label="Currency" className="flex-1">
          <select name="currency" defaultValue={existing?.currency ?? baseCurrency} className={inputClass}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Interest rate %" className="flex-1">
          <input type="number" step="0.01" name="interest_rate" defaultValue={existing?.interest_rate ?? 0} className={inputClass} />
        </Field>
      </div>
      <Field label="Monthly payment">
        <input type="number" step="0.01" name="monthly_payment" defaultValue={existing?.monthly_payment ?? 0} className={inputClass} />
      </Field>
      <div className="flex gap-2">
        <Field label="Start date" className="flex-1">
          <input type="date" name="start_date" defaultValue={existing?.start_date ?? ''} className={inputClass} />
        </Field>
        <Field label="Expected end date" className="flex-1">
          <input type="date" name="expected_end_date" defaultValue={existing?.expected_end_date ?? ''} className={inputClass} />
        </Field>
      </div>
      <Field label="Linked account">
        <select name="account_id" defaultValue={existing?.account_id ?? ''} className={inputClass}>
          <option value="">None</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Person">
        <select name="person_id" defaultValue={existing?.person_id ?? ''} className={inputClass}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes">
        <textarea name="notes" rows={2} defaultValue={existing?.notes ?? ''} className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-teal-900/70">
        <input type="checkbox" name="is_unconfirmed" defaultChecked={existing?.is_unconfirmed} className="h-4 w-4 rounded border-teal-900/20" />
        Unconfirmed — not verified against a bank statement
      </label>
      <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
        {existing ? 'Save changes' : 'Add liability'}
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
