'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { HouseholdData } from '@/lib/supabase/queries';
import type { ReceiptItem } from '@/lib/finance/types';
import { parseReceiptText } from '@/lib/finance/parseReceiptText';
import { findReceiptMatchCandidates, receiptItemsTotal } from '@/lib/finance/receiptMatch';
import { attachReceiptItems, createTransactionFromReceipt } from '@/lib/actions/transactions';
import { PageHeader } from '@/components/PageHeader';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';

export function ReceiptsClient({ data }: { data: HouseholdData }) {
  const router = useRouter();
  const [raw, setRaw] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<ReceiptItem[] | null>(null);
  const [busy, setBusy] = useState(false);

  const total = items ? receiptItemsTotal(items) : 0;
  const candidates = items
    ? findReceiptMatchCandidates(date, total, data.transactions).slice(0, 5)
    : [];

  async function attach(transactionId: string) {
    if (!items) return;
    setBusy(true);
    try {
      await attachReceiptItems(transactionId, items);
      router.push('/transactions');
    } finally {
      setBusy(false);
    }
  }

  async function createNew(formData: FormData) {
    if (!items) return;
    setBusy(true);
    try {
      await createTransactionFromReceipt(formData, items);
      router.push('/transactions');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Scan Receipts" backHref="/more" />

      <Card className="mb-4">
        <SectionHeader title="1. Paste receipt lines" />
        <p className="mb-2 text-xs text-teal-900/50">One item per line: name, quantity, price — or just name and price.</p>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 font-mono text-xs"
          placeholder={'Tesco Baby Button Mushrooms 200g  1  1.20\nTesco British Lamb Mince 500g  1  6.50'}
        />
        <div className="mt-2 flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 text-sm" />
          <button
            onClick={() => setItems(parseReceiptText(raw))}
            className="flex-1 rounded-xl bg-teal-900 py-2.5 text-sm font-medium text-white"
          >
            Parse items
          </button>
        </div>
      </Card>

      {items && (
        <>
          <Card className="mb-4">
            <SectionHeader title={`2. Review (${items.length} items)`} />
            <div className="max-h-48 space-y-1 overflow-y-auto text-sm">
              {items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-teal-900/80">
                    {it.quantity}× {it.name}
                  </span>
                  <Money amount={it.price * it.quantity} currency={data.household.base_currency} compact />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-teal-900/[0.06] pt-2 text-sm font-medium">
              <span>Total</span>
              <Money amount={total} currency={data.household.base_currency} />
            </div>
          </Card>

          <Card className="mb-4">
            <SectionHeader title="3. Attach to an existing transaction" />
            <p className="mb-2 text-xs text-teal-900/50">
              Best match first — searches un-itemized expenses within 3 days and ~5% of the total.
            </p>
            {candidates.length === 0 && <p className="text-sm text-teal-900/50">No close match found in your statement.</p>}
            <div className="space-y-2">
              {candidates.map((c) => (
                <button
                  key={c.transaction.id}
                  disabled={busy}
                  onClick={() => attach(c.transaction.id)}
                  className="flex w-full items-center justify-between rounded-xl bg-teal-900/[0.04] px-3 py-2 text-left text-sm disabled:opacity-50"
                >
                  <span>
                    {c.transaction.description || 'Untitled'} · {c.transaction.date}
                  </span>
                  <Money amount={c.transaction.amount} currency={c.transaction.currency} compact />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Not in my statement yet" />
            <form action={createNew} className="space-y-2">
              <input type="hidden" name="date" value={date} />
              <input type="hidden" name="amount" value={total} />
              <input type="hidden" name="currency" value={data.household.base_currency} />
              <input name="description" placeholder="Description" required className={inputClass} />
              <select name="account_id" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Account
                </option>
                {data.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <select name="category_id" defaultValue="" className={inputClass}>
                <option value="">Uncategorized</option>
                {data.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select name="person_id" defaultValue="" className={inputClass}>
                <option value="">Unassigned</option>
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={busy} className="w-full rounded-xl border border-teal-900/20 py-2.5 text-sm font-medium text-teal-900 disabled:opacity-50">
                Create new itemized expense
              </button>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 text-sm text-teal-900';
