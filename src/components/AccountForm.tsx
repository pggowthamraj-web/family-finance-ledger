'use client';

import type { Account, Member } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';

const ACCOUNT_TYPES = ['Bank Account', 'Cash', 'Credit Card', 'Savings Account', 'Investment Account', 'Digital Wallet'];

export function AccountForm({
  action,
  members,
  baseCurrency,
  existing,
}: {
  action: (formData: FormData) => void | Promise<void>;
  members: Member[];
  baseCurrency: string;
  existing?: Account;
}) {
  return (
    <form action={action} className="space-y-4">
      <Field label="Name">
        <input name="name" required defaultValue={existing?.name} className={inputClass} />
      </Field>
      <Field label="Type">
        <select name="type" required defaultValue={existing?.type ?? 'Bank Account'} className={inputClass}>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        <Field label="Balance" className="flex-[2]">
          <input type="number" step="0.01" name="balance" defaultValue={existing?.balance ?? 0} className={inputClass} />
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
      <Field label="Owner">
        <select name="owner_id" defaultValue={existing?.owner_id ?? ''} className={inputClass}>
          <option value="">Shared / household</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Country">
        <input name="country" defaultValue={existing?.country ?? ''} className={inputClass} />
      </Field>
      <Field label="Notes">
        <textarea name="notes" rows={2} defaultValue={existing?.notes ?? ''} className={inputClass} placeholder="e.g. Derived from internal transfers — no direct statement yet" />
      </Field>
      <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
        {existing ? 'Save changes' : 'Add account'}
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
