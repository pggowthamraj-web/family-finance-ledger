'use client';

import type { FarmFertilizerApplication } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';

export function FertilizerForm({
  action,
  existing,
}: {
  action: (formData: FormData) => void | Promise<void>;
  existing?: FarmFertilizerApplication;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="flex gap-2">
        <Field label="Date" className="flex-1">
          <input
            type="date"
            name="application_date"
            required
            defaultValue={existing?.application_date ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="No. of trees" className="flex-1">
          <input type="number" name="trees_count" defaultValue={existing?.trees_count ?? 0} className={inputClass} />
        </Field>
      </div>

      <div className="flex gap-2">
        <Field label="Fertiliser cost / tree" className="flex-1">
          <input
            type="number"
            step="0.01"
            name="fertilizer_cost_per_tree"
            defaultValue={existing?.fertilizer_cost_per_tree ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label="Labour cost / tree" className="flex-1">
          <input
            type="number"
            step="0.01"
            name="labour_cost_per_tree"
            defaultValue={existing?.labour_cost_per_tree ?? 0}
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

      <p className="text-xs text-teal-900/40">Total cost = no. of trees × (fertiliser cost/tree + labour cost/tree).</p>

      <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
        {existing ? 'Save changes' : 'Add application'}
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
