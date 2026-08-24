'use client';

import type { Investment, Member } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';

const TYPES = ['LIC Insurance', 'Mutual Fund', 'PPF', 'Stocks', 'Fixed Deposit', 'Other'];
const FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'];

export function InvestmentForm({
  action,
  members,
  baseCurrency,
  existing,
}: {
  action: (formData: FormData) => void | Promise<void>;
  members: Member[];
  baseCurrency: string;
  existing?: Investment;
}) {
  return (
    <form action={action} className="space-y-4">
      <Field label="Name">
        <input name="name" required defaultValue={existing?.name} className={inputClass} />
      </Field>
      <Field label="Type">
        <select name="type" required defaultValue={existing?.type ?? 'Mutual Fund'} className={inputClass}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Provider">
        <input name="provider" defaultValue={existing?.provider ?? ''} className={inputClass} />
      </Field>
      <Field label="Owner">
        <select name="owner_id" defaultValue={existing?.owner_id ?? ''} className={inputClass}>
          <option value="">Shared</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        <Field label="Invested amount" className="flex-1">
          <input type="number" step="0.01" name="invested_amount" defaultValue={existing?.invested_amount ?? 0} className={inputClass} />
        </Field>
        <Field label="Current value" className="flex-1">
          <input type="number" step="0.01" name="current_value" defaultValue={existing?.current_value ?? 0} className={inputClass} />
        </Field>
      </div>
      <Field label="Currency">
        <select name="currency" defaultValue={existing?.currency ?? baseCurrency} className={inputClass}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        <Field label="Start date" className="flex-1">
          <input type="date" name="start_date" defaultValue={existing?.start_date ?? ''} className={inputClass} />
        </Field>
        <Field label="Maturity date" className="flex-1">
          <input type="date" name="maturity_date" defaultValue={existing?.maturity_date ?? ''} className={inputClass} />
        </Field>
      </div>
      <Field label="Maturity amount">
        <input type="number" step="0.01" name="maturity_amount" defaultValue={existing?.maturity_amount ?? ''} className={inputClass} />
      </Field>
      <div className="flex gap-2">
        <Field label="Premium amount" className="flex-1">
          <input type="number" step="0.01" name="premium_amount" defaultValue={existing?.premium_amount ?? ''} className={inputClass} />
        </Field>
        <Field label="Premium frequency" className="flex-1">
          <select name="premium_frequency" defaultValue={existing?.premium_frequency ?? 'yearly'} className={inputClass}>
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Folio / policy number">
        <input name="folio_number" defaultValue={existing?.folio_number ?? ''} className={inputClass} />
      </Field>
      <Field label="Notes">
        <textarea name="notes" rows={2} defaultValue={existing?.notes ?? ''} className={inputClass} />
      </Field>
      <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
        {existing ? 'Save changes' : 'Add investment'}
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
