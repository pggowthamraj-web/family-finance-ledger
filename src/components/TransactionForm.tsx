'use client';

import { useState } from 'react';
import type { Account, Category, Member, Subcategory, Transaction, TransactionType } from '@/lib/finance/types';
import { CURRENCIES } from '@/lib/finance/currency';

export function TransactionForm({
  action,
  accounts,
  categories,
  subcategories,
  members,
  baseCurrency,
  defaultType = 'expense',
  existing,
}: {
  action: (formData: FormData) => void | Promise<void>;
  accounts: Account[];
  categories: Category[];
  subcategories: Subcategory[];
  members: Member[];
  baseCurrency: string;
  defaultType?: TransactionType;
  existing?: Transaction;
}) {
  const [type, setType] = useState<TransactionType>(existing?.type ?? defaultType);
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? '');
  const subOptions = subcategories.filter((s) => s.category_id === categoryId);

  return (
    <form action={action} className="space-y-4">
      <div className="flex rounded-xl bg-teal-900/[0.06] p-1">
        {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition ${
              type === t ? 'bg-white shadow-card text-teal-900' : 'text-teal-900/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <input type="hidden" name="type" value={type} />

      <Field label="Date">
        <input type="date" name="date" required defaultValue={existing?.date ?? new Date().toISOString().slice(0, 10)} className={inputClass} />
      </Field>

      <div className="flex gap-2">
        <Field label="Amount" className="flex-[2]">
          <input type="number" step="0.01" min="0" name="amount" required defaultValue={existing?.amount} className={inputClass} />
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

      <Field label="Description">
        <input type="text" name="description" defaultValue={existing?.description ?? ''} className={inputClass} placeholder="e.g. Tesco Sheldon Superstore" />
      </Field>

      <Field label={type === 'transfer' ? 'From account' : 'Account'}>
        <select name="account_id" required defaultValue={existing?.account_id ?? ''} className={inputClass}>
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

      {type === 'transfer' && (
        <Field label="To account">
          <select name="to_account_id" required defaultValue={existing?.to_account_id ?? ''} className={inputClass}>
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
      )}

      {type !== 'transfer' && (
        <div className="flex gap-2">
          <Field label="Category" className="flex-1">
            <select
              name="category_id"
              defaultValue={existing?.category_id ?? ''}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          {subOptions.length > 0 && (
            <Field label="Subcategory" className="flex-1">
              <select name="subcategory_id" defaultValue={existing?.subcategory_id ?? ''} className={inputClass}>
                <option value="">None</option>
                {subOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
      )}

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
        <textarea name="notes" defaultValue={existing?.notes ?? ''} rows={2} className={inputClass} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-teal-900/70">
        <input type="checkbox" name="recurring" defaultChecked={existing?.recurring} className="h-4 w-4 rounded border-teal-900/20" />
        This looks like a recurring bill (informational only)
      </label>

      <button type="submit" className="w-full rounded-xl bg-teal-900 py-3 font-medium text-white active:scale-[0.99]">
        {existing ? 'Save changes' : 'Add transaction'}
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
