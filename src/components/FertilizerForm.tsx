'use client';

import { useState } from 'react';
import type { FarmFertilizerApplication } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';
import { fertilizerApplicationCost } from '@/lib/finance/farm';
import { Money } from '@/components/ui/Money';

export function FertilizerForm({
  action,
  existing,
}: {
  action: (formData: FormData) => void | Promise<void>;
  existing?: FarmFertilizerApplication;
}) {
  const [currency, setCurrency] = useState(existing?.currency ?? 'INR');
  const [treesCount, setTreesCount] = useState(existing?.trees_count ?? 0);
  const [fertilizerCost, setFertilizerCost] = useState(existing?.fertilizer_cost_per_tree ?? 0);
  const [labourCost, setLabourCost] = useState(existing?.labour_cost_per_tree ?? 0);

  const totalCost = fertilizerApplicationCost({
    trees_count: treesCount,
    fertilizer_cost_per_tree: fertilizerCost,
    labour_cost_per_tree: labourCost,
  });

  return (
    <form action={action} className="space-y-4">
      <div className="rounded-xl bg-teal-900/[0.06] p-3">
        <p className="text-xs font-medium text-teal-900/60">Total cost for this application</p>
        <Money amount={totalCost} currency={currency} className="text-xl text-rose-600" />
        <p className="mt-0.5 text-[11px] text-teal-900/40">Updates live as you edit the fields below.</p>
      </div>

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
          <input
            type="number"
            name="trees_count"
            value={treesCount}
            onChange={(e) => setTreesCount(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Field label="Fertiliser cost / tree" className="flex-1">
          <input
            type="number"
            step="0.01"
            name="fertilizer_cost_per_tree"
            value={fertilizerCost}
            onChange={(e) => setFertilizerCost(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </Field>
        <Field label="Labour cost / tree" className="flex-1">
          <input
            type="number"
            step="0.01"
            name="labour_cost_per_tree"
            value={labourCost}
            onChange={(e) => setLabourCost(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Field label="Currency" className="flex-1">
          <select name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
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
