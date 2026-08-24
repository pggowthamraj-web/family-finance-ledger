'use client';

import type { Asset, Member } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';

export function AssetForm({
  action,
  members,
  baseCurrency,
  existing,
}: {
  action: (formData: FormData) => void | Promise<void>;
  members: Member[];
  baseCurrency: string;
  existing?: Asset;
}) {
  return (
    <form action={action} className="space-y-4">
      <Field label="Name">
        <input name="name" required defaultValue={existing?.name} className={inputClass} />
      </Field>
      <Field label="Type">
        <input name="type" required defaultValue={existing?.type ?? 'Property'} className={inputClass} placeholder="Property, Gold, Vehicle..." />
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
        <Field label="Purchase value" className="flex-1">
          <input type="number" step="0.01" name="purchase_value" defaultValue={existing?.purchase_value ?? 0} className={inputClass} />
        </Field>
        <Field label="Current value" className="flex-1">
          <input type="number" step="0.01" name="current_value" defaultValue={existing?.current_value ?? 0} className={inputClass} />
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
        <Field label="Purchase date" className="flex-1">
          <input type="date" name="purchase_date" defaultValue={existing?.purchase_date ?? ''} className={inputClass} />
        </Field>
      </div>
      <Field label="Country">
        <input name="country" defaultValue={existing?.country ?? ''} className={inputClass} />
      </Field>
      <Field label="Notes">
        <textarea name="notes" rows={2} defaultValue={existing?.notes ?? ''} className={inputClass} />
      </Field>
      <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
        {existing ? 'Save changes' : 'Add asset'}
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
