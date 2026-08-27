'use client';

import type { FarmHarvest } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';

export function HarvestForm({
  action,
  existing,
}: {
  action: (formData: FormData) => void | Promise<void>;
  existing?: FarmHarvest;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="flex gap-2">
        <Field label="Date of harvest" className="flex-1">
          <input type="date" name="harvest_date" required defaultValue={existing?.harvest_date ?? ''} className={inputClass} />
        </Field>
        <Field label="Trees harvested" className="flex-1">
          <input
            type="number"
            name="trees_harvested"
            defaultValue={existing?.trees_harvested ?? 0}
            className={inputClass}
          />
        </Field>
      </div>

      <p className="text-xs font-medium text-teal-900/50">Small coconuts</p>
      <div className="flex gap-2">
        <Field label="Count" className="flex-1">
          <input
            type="number"
            name="small_coconuts_count"
            defaultValue={existing?.small_coconuts_count ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label="Price per coconut" className="flex-1">
          <input
            type="number"
            step="0.01"
            name="small_coconut_price"
            defaultValue={existing?.small_coconut_price ?? 0}
            className={inputClass}
          />
        </Field>
      </div>

      <p className="text-xs font-medium text-teal-900/50">Big coconuts</p>
      <div className="flex gap-2">
        <Field label="Count" className="flex-1">
          <input
            type="number"
            name="big_coconuts_count"
            defaultValue={existing?.big_coconuts_count ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label="Price per coconut" className="flex-1">
          <input
            type="number"
            step="0.01"
            name="big_coconut_price"
            defaultValue={existing?.big_coconut_price ?? 0}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Field label="Watchman salary" className="flex-1">
          <input
            type="number"
            step="0.01"
            name="watchman_salary"
            defaultValue={existing?.watchman_salary ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label="Labour charges" className="flex-1">
          <input
            type="number"
            step="0.01"
            name="labour_charges"
            defaultValue={existing?.labour_charges ?? 0}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Field label="Currency" className="flex-1">
          <select name="currency" defaultValue={existing?.currency ?? 'INR'} className={inputClass}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Performed by" className="flex-1">
          <input
            name="performed_by"
            defaultValue={existing?.performed_by ?? ''}
            placeholder="Person or firm"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea name="notes" rows={2} defaultValue={existing?.notes ?? ''} className={inputClass} />
      </Field>

      <p className="text-xs text-teal-900/40">Income = (small count × small price) + (big count × big price) − labour charges − watchman salary.</p>

      <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
        {existing ? 'Save changes' : 'Add harvest'}
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
