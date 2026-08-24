'use client';

import type { Account, Goal, Member } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';

export function GoalForm({
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
  existing?: Goal;
}) {
  return (
    <form action={action} className="space-y-4">
      <Field label="Name">
        <input name="name" required defaultValue={existing?.name} className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea name="description" rows={2} defaultValue={existing?.description ?? ''} className={inputClass} />
      </Field>
      <div className="flex gap-2">
        <Field label="Target amount" className="flex-[2]">
          <input type="number" step="0.01" name="target_amount" required defaultValue={existing?.target_amount} className={inputClass} />
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
      <Field label="Current amount saved">
        <input type="number" step="0.01" name="current_amount" defaultValue={existing?.current_amount ?? 0} className={inputClass} />
      </Field>
      <Field label="Target date">
        <input type="date" name="target_date" defaultValue={existing?.target_date ?? ''} className={inputClass} />
      </Field>
      <Field label="Planned monthly contribution">
        <input type="number" step="0.01" name="monthly_contribution" defaultValue={existing?.monthly_contribution ?? 0} className={inputClass} />
      </Field>
      <Field label="Priority">
        <select name="priority" defaultValue={existing?.priority ?? 'Medium'} className={inputClass}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </Field>
      <Field label="Owner">
        <select name="owner_id" defaultValue={existing?.owner_id ?? 'shared'} className={inputClass}>
          <option value="shared">Shared</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>
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
      <Field label="Notes">
        <textarea name="notes" rows={2} defaultValue={existing?.notes ?? ''} className={inputClass} />
      </Field>
      <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
        {existing ? 'Save changes' : 'Add goal'}
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
