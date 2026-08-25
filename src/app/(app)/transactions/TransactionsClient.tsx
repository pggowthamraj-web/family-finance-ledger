'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Loader2 } from 'lucide-react';
import type { Account, Category, Member, Transaction } from '@/lib/finance/types';
import type { TransactionFilters } from '@/lib/supabase/queries';
import { loadTransactionsPage } from '@/lib/actions/transactions';
import { Card } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { PageHeader } from '@/components/PageHeader';

export function TransactionsClient({
  members,
  categories,
  accounts,
  initialTransactions,
  initialTotal,
  initialHasMore,
  currencies,
  countries,
}: {
  members: Member[];
  categories: Category[];
  accounts: Account[];
  initialTransactions: Transaction[];
  initialTotal: number;
  initialHasMore: boolean;
  currencies: string[];
  countries: string[];
}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [personId, setPersonId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currency, setCurrency] = useState('');
  const [country, setCountry] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [transactions, setTransactions] = useState(initialTransactions);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  // Debounce the free-text search so it doesn't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filters: TransactionFilters = {
    search: debouncedQuery || undefined,
    personId: personId || undefined,
    categoryId: categoryId || undefined,
    currency: currency || undefined,
    country: country || undefined,
    from: from || undefined,
    to: to || undefined,
  };
  const filtersKey = JSON.stringify(filters);

  // Ignore stale responses if filters change again before an in-flight fetch resolves.
  const requestId = useRef(0);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      // Skip the refetch on mount -- the server already gave us page 0 for empty filters.
      isFirstRun.current = false;
      return;
    }
    const thisRequest = ++requestId.current;
    startTransition(async () => {
      const page = await loadTransactionsPage(filters, 0);
      if (thisRequest !== requestId.current || !page) return;
      setTransactions(page.transactions);
      setTotal(page.total);
      setHasMore(page.hasMore);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  function loadMore() {
    const thisRequest = ++requestId.current;
    startTransition(async () => {
      const page = await loadTransactionsPage(filters, transactions.length);
      if (thisRequest !== requestId.current || !page) return;
      setTransactions((prev) => [...prev, ...page.transactions]);
      setTotal(page.total);
      setHasMore(page.hasMore);
    });
  }

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

      <p className="mb-2 flex items-center gap-1.5 text-xs text-teal-900/50">
        {transactions.length} of {total} transactions
        {isPending && <Loader2 size={12} className="animate-spin" />}
      </p>

      <div className="space-y-2">
        {transactions.map((t) => {
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
                        {t.type === 'transfer'
                          ? `${accountName(t.account_id)} → ${accountName(t.to_account_id ?? '')}`
                          : categoryName(t.category_id)}
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
        {transactions.length === 0 && !isPending && (
          <p className="py-8 text-center text-sm text-teal-900/40">No transactions match these filters.</p>
        )}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-900/10 py-3 text-sm font-medium text-teal-900 disabled:opacity-50"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Load more
          </button>
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
