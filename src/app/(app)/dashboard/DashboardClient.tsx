'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { HouseholdData } from '@/lib/supabase/queries';
import { calculateNetWorth } from '@/lib/finance/networth';
import {
  filterForDashboard,
  computeSummary,
  topCategories,
  categoryByPerson,
  categoryTrend,
  type PeriodFilter,
} from '@/lib/finance/dashboard';
import { recurringMonthlyCommitment } from '@/lib/finance/recurring';
import { excludeTransfers } from '@/lib/finance/transfers';
import { goalProgress } from '@/lib/finance/goals';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Target } from 'lucide-react';

type PeriodKind = 'month' | 'year' | 'financial-year' | 'all';

export function DashboardClient({ data }: { data: HouseholdData }) {
  const { household, members, categories, transactions, assets, investments, liabilities, recurringTransactions, goals } = data;
  const rates = household.exchange_rates;

  const now = new Date();
  const [periodKind, setPeriodKind] = useState<PeriodKind>('month');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [personId, setPersonId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  const period: PeriodFilter = useMemo(() => {
    switch (periodKind) {
      case 'month':
        return { kind: 'month', year, month };
      case 'year':
        return { kind: 'year', year };
      case 'financial-year':
        return { kind: 'financial-year', fyStartYear: month >= 4 ? year : year - 1 };
      case 'all':
      default:
        return { kind: 'all' };
    }
  }, [periodKind, year, month]);

  const filtered = useMemo(
    () => filterForDashboard(transactions, { period, personId: personId || null, categoryId: categoryId || null }),
    [transactions, period, personId, categoryId]
  );

  const summary = useMemo(() => computeSummary(filtered, rates), [filtered, rates]);
  const { netWorth, totalAssets, totalInvestments, totalLiabilities } = useMemo(
    () => calculateNetWorth(assets, investments, liabilities, rates),
    [assets, investments, liabilities, rates]
  );
  const commitment = useMemo(() => recurringMonthlyCommitment(recurringTransactions, rates), [recurringTransactions, rates]);
  const oneTimeSpend = Math.max(0, summary.expense - commitment);

  const top5 = useMemo(() => topCategories(filtered, rates, 5), [filtered, rates]);
  const categoryDetail = useMemo(() => {
    if (!categoryId) return null;
    const byPerson = categoryByPerson(filterForDashboard(transactions, { period, personId: personId || null }), categoryId, rates);
    const trend = categoryTrend(transactions, categoryId, rates, 6);
    return { byPerson, trend };
  }, [categoryId, transactions, period, personId, rates]);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';
  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? 'Unassigned';

  const topGoals = [...goals]
    .sort((a, b) => (b.priority === 'High' ? 1 : 0) - (a.priority === 'High' ? 1 : 0))
    .slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Net worth hero */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-900 to-teal-800 p-5 text-white shadow-card">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-200">Net worth</p>
        <p className="mt-1 font-display text-4xl font-medium">
          <Money amount={netWorth} currency={household.base_currency} />
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-teal-100">
          <div>
            <p className="text-teal-300">Assets</p>
            <Money amount={totalAssets + totalInvestments} currency={household.base_currency} compact className="text-sm text-white" />
          </div>
          <div>
            <p className="text-teal-300">Liabilities</p>
            <Money amount={totalLiabilities} currency={household.base_currency} compact className="text-sm text-white" />
          </div>
          <div>
            <p className="text-teal-300">Savings rate</p>
            <span className="font-mono text-sm text-white">{summary.savingsRate.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: '/transactions/new?type=expense', label: 'Expense', icon: ArrowUpRight, tone: 'text-rose-500' },
          { href: '/transactions/new?type=income', label: 'Income', icon: ArrowDownLeft, tone: 'text-emerald-500' },
          { href: '/accounts/transfer', label: 'Transfer', icon: ArrowLeftRight, tone: 'text-teal-700' },
          { href: '/goals/contribute', label: 'Goal', icon: Target, tone: 'text-amber-500' },
        ].map(({ href, label, icon: Icon, tone }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 text-center shadow-card">
            <Icon size={20} className={tone} />
            <span className="text-[11px] font-medium text-teal-900/80">{label}</span>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <Card className="space-y-2">
        <div className="flex gap-2 overflow-x-auto">
          {(['month', 'year', 'financial-year', 'all'] as PeriodKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setPeriodKind(k)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                periodKind === k ? 'bg-teal-900 text-white' : 'bg-teal-900/[0.06] text-teal-900/70'
              }`}
            >
              {{ month: 'Month', year: 'Year', 'financial-year': 'Financial Year', all: 'All Time' }[k]}
            </button>
          ))}
        </div>

        {(periodKind === 'month' || periodKind === 'financial-year') && (
          <div className="flex gap-2">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="flex-1 rounded-xl border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-sm">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString(undefined, { month: 'long' })}
                </option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 rounded-xl border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-sm">
              {Array.from({ length: 6 }, (_, i) => now.getFullYear() - 3 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
        {periodKind === 'year' && (
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-sm">
            {Array.from({ length: 6 }, (_, i) => now.getFullYear() - 3 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2">
          <select value={personId} onChange={(e) => setPersonId(e.target.value)} className="flex-1 rounded-xl border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-sm">
            <option value="">Everyone</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="flex-1 rounded-xl border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-sm">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-medium text-teal-900/50">Income</p>
          <Money amount={summary.income} currency={household.base_currency} className="text-lg text-emerald-500" compact />
        </Card>
        <Card>
          <p className="text-xs font-medium text-teal-900/50">Expense</p>
          <Money amount={summary.expense} currency={household.base_currency} className="text-lg text-rose-500" compact />
        </Card>
        <Card>
          <p className="text-xs font-medium text-teal-900/50">Cash flow</p>
          <Money
            amount={summary.cashFlow}
            currency={household.base_currency}
            signed
            compact
            className={`text-lg ${summary.cashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
          />
        </Card>
        <Card>
          <p className="text-xs font-medium text-teal-900/50">Savings rate</p>
          <p className="font-mono text-lg tabular-nums text-teal-900">{summary.savingsRate.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Recurring commitment vs one-time */}
      <Card>
        <SectionHeader title="Spending mix" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-teal-900/60">Recurring commitment / mo</span>
          <Money amount={commitment} currency={household.base_currency} />
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-teal-900/60">One-time spend (this period)</span>
          <Money amount={oneTimeSpend} currency={household.base_currency} />
        </div>
      </Card>

      {/* Category detail or top-5 */}
      {categoryDetail ? (
        <Card>
          <SectionHeader title={`${categoryName(categoryId)} — detail`} />
          <p className="mb-3 text-2xl font-display text-teal-900">
            <Money amount={summary.expense > 0 ? Object.values(categoryDetail.byPerson).reduce((a, b) => a + b, 0) : 0} currency={household.base_currency} />
          </p>
          <div className="mb-4 space-y-1">
            {Object.entries(categoryDetail.byPerson).map(([pid, total]) => (
              <div key={pid} className="flex justify-between text-sm">
                <span className="text-teal-900/70">{memberName(pid)}</span>
                <Money amount={total} currency={household.base_currency} />
              </div>
            ))}
          </div>
          <p className="mb-1 text-xs font-medium text-teal-900/50">Last 6 months</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryDetail.trend}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(m) => m.slice(5)} />
                <Tooltip formatter={(v: number) => v.toFixed(2)} />
                <Line type="monotone" dataKey="total" stroke="#0f3d3d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card>
          <SectionHeader title="Top spending categories" />
          <div className="space-y-2">
            {top5.length === 0 && <p className="text-sm text-teal-900/50">No expenses in this period.</p>}
            {top5.map(({ categoryId: cid, total }) => (
              <button key={cid} onClick={() => setCategoryId(cid)} className="flex w-full items-center justify-between text-sm">
                <span className="text-teal-900/80">{categoryName(cid)}</span>
                <Money amount={total} currency={household.base_currency} />
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Goal progress preview */}
      <Card>
        <SectionHeader title="Goals" action={<Link href="/goals" className="text-xs font-medium text-teal-700">See all</Link>} />
        <div className="space-y-3">
          {topGoals.map((g) => {
            const progress = goalProgress(g);
            return (
              <div key={g.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-teal-900">{g.name}</span>
                  {g.priority && <Badge tone={g.priority === 'High' ? 'amber' : 'neutral'}>{g.priority}</Badge>}
                </div>
                <ProgressBar percent={progress.percent} tone="amber" />
                <div className="mt-1 flex justify-between text-xs text-teal-900/50">
                  <span>
                    <Money amount={g.current_amount} currency={g.currency} compact /> of{' '}
                    <Money amount={g.target_amount} currency={g.currency} compact />
                  </span>
                  <span>{progress.percent.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
          {topGoals.length === 0 && <p className="text-sm text-teal-900/50">No goals yet.</p>}
        </div>
      </Card>

      <div className="text-center text-xs text-teal-900/60 underline">
        <Link href="/transactions">{excludeTransfers(transactions).length} transactions total</Link>
      </div>
    </div>
  );
}
