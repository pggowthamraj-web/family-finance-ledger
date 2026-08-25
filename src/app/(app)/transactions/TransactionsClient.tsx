'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import type { HouseholdData } from '@/lib/supabase/queries';
import { Card } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { PageHeader } from '@/components/PageHeader';

export function TransactionsClient({ data }: { data: HouseholdData }) {
  const { transactions, categories, members, accounts } = data;
  const [query, setQuery] = useState('');
  const [personId, setPersonId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currency, setCurrency] = useState('');
  const [country, setCountry] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const countries = useMemo(
    () => [...new Set(transactions.map((t) => t.country).filter(Boolean))] as string[],
    [transactions]
  );
  const currencies = useMemo(() => [...new Set(transactions.map((t) => t.currency))], [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (query && !(t.description ?? '').toLowerCase().includes(query.toLowerCase())) return false;
      if (personId && t.person_id !== personId) return false;
      if (categoryId && t.category_id !== categoryId) return false;
      if (currency && t.currency !== currency) return false;
      if (country && t.country !== country) return false;
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      return true;
    });
  }, [transactions, query, personId, categoryId, currency, country, from, to]);

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader title="Transactions" />

      <Card className="mb-4 space-y-2">
        <div className="flex items-center gap-2 rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2">
          <Search size={16} className="text-teal-900/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search description..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={selectClass} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={personId} onChange={(e) => setPersonId(e.target.value)} className={selectClass}>
            <option value="">Everyone</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectClass}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
            <option value="">All currencies</option>
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <p className="mb-2 text-xs text-teal-900/50">{filtered.length} transactions</p>

      <div className="space-y-2">
        {filtered.slice(0, 200).map((t) => {
          const person = members.find((m) => m.id === t.person_id);
          return (
          <Link key={t.id} href={`/transactions/${t.id}/edit`} className="block">
            <Card className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                    t.type === 'income' ? 'bg-emerald-100' : t.type === 'expense' ? 'bg-rose-100' : 'bg-teal-900/[0.08]'
                  }`}
                >
                  {t.type === 'income' ? (
                    <ArrowDownLeft size={16} className="text-emerald-500" />
                  ) : t.type === 'expense' ? (
                    <ArrowUpRight size={16} className="text-rose-500" />
                  ) : (
                    <ArrowLeftRight size={16} className="text-teal-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-teal-900">{t.description || 'Untitled'}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-teal-900/50">
                    <span className="flex-shrink-0 whitespace-nowrap">{t.date} ·</span>
                    {person && (
                      <span
                        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                        style={{ backgroundColor: colorFor(person.color) }}
                      >
                        {person.name.slice(0, 1)}
                      </span>
                    )}
                    <span className="truncate">
                      {t.type === 'transfer' ? `${accountName(t.account_id)} → ${accountName(t.to_account_id ?? '')}` : categoryName(t.category_id)}
                    </span>
                  </p>
                </div>
              </div>
              <Money
                amount={t.amount}
                currency={t.currency}
                signed={t.type !== 'transfer'}
                className={`flex-shrink-0 whitespace-nowrap ${
                  t.type === 'income' ? 'text-emerald-500' : t.type === 'expense' ? 'text-rose-500' : 'text-teal-900/70'
                }`}
              />
            </Card>
          </Link>
          );
        })}
        {filtered.length > 200 && (
          <p className="py-4 text-center text-xs text-teal-900/40">Showing first 200 — narrow your filters to see more.</p>
        )}
      </div>
    </div>
  );
}

const selectClass = 'rounded-xl border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-sm';

function colorFor(color: string | null): string {
  const map: Record<string, string> = { teal: '#0f3d3d', amber: '#f5a623', rose: '#e94560', emerald: '#0f9d70' };
  return map[color ?? ''] ?? '#0f3d3d';
}
