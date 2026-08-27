import Link from 'next/link';
import { Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getHouseholdData } from '@/lib/supabase/queries';
import { recurringMonthlyCommitment, monthlyNormalizedAmount, isRecurringCurrentlyInWindow } from '@/lib/finance/recurring';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Money } from '@/components/ui/Money';

export default async function RecurringPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const { recurringTransactions, categories, household } = data;

  const today = new Date().toISOString().slice(0, 10);
  const commitment = recurringMonthlyCommitment(recurringTransactions, household.exchange_rates, { today });
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';

  // Active items first, inactive items pushed to the end; stable within each group.
  const sorted = [...recurringTransactions].sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <div>
      <PageHeader title="Recurring Transactions" backHref="/more" />

      <Card className="mb-4">
        <p className="text-xs font-medium text-teal-900/50">Monthly commitment (expenses only)</p>
        <Money amount={commitment} currency={household.base_currency} className="text-2xl" />
        <p className="mt-1 text-xs text-teal-900/40">
          Informational only — normalized by frequency, never counted in actual transaction totals. Only active items
          within their start/end date window count toward this figure.
        </p>
      </Card>

      <div className="space-y-2">
        {sorted.map((r) => {
          const inWindow = isRecurringCurrentlyInWindow(r, today);
          const statusHint =
            r.active && !inWindow
              ? r.start_date && today < r.start_date
                ? `Starts ${r.start_date}`
                : r.end_date && today > r.end_date
                  ? `Ended ${r.end_date}`
                  : null
              : null;

          return (
            <Link key={r.id} href={`/more/recurring/${r.id}/edit`} className="block">
              <Card className={`flex items-center justify-between gap-3 py-3 ${!r.active ? 'opacity-60' : ''}`}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                      !r.active
                        ? 'bg-teal-900/[0.06]'
                        : r.type === 'income'
                          ? 'bg-emerald-100'
                          : 'bg-rose-100'
                    }`}
                  >
                    {r.type === 'income' ? (
                      <ArrowDownLeft size={16} className={!r.active ? 'text-teal-900/30' : 'text-emerald-500'} />
                    ) : (
                      <ArrowUpRight size={16} className={!r.active ? 'text-teal-900/30' : 'text-rose-500'} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-teal-900">{r.description}</p>
                    <p className="mt-0.5 truncate text-xs text-teal-900/50">
                      {categoryName(r.category_id)} · {r.frequency}
                    </p>
                    {!r.active && <Badge className="mt-1">Inactive</Badge>}
                    {statusHint && (
                      <Badge tone="amber" className="mt-1">
                        {statusHint}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <Money
                    amount={r.amount}
                    currency={r.currency}
                    className={`whitespace-nowrap ${
                      !r.active ? 'text-teal-900/40' : r.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  />
                  <p className="text-[10px] text-teal-900/40">
                    ≈ <Money amount={monthlyNormalizedAmount(r)} currency={r.currency} compact /> /mo
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
        {sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-teal-900/40">No recurring items yet.</p>
        )}
      </div>

      <Link
        href="/more/recurring/new"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-900/20 py-3 text-sm font-medium text-teal-900/60"
      >
        <Plus size={16} /> Add recurring item
      </Link>
    </div>
  );
}
