import Link from 'next/link';
import { getHouseholdData } from '@/lib/supabase/queries';
import { PageHeader } from '@/components/PageHeader';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { Badge } from '@/components/ui/Badge';
import { Plus } from 'lucide-react';

export default async function InvestmentsPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const { investments, members, household } = data;

  const ownerName = (id: string | null) => members.find((m) => m.id === id)?.name ?? 'Shared';
  const totalInvested = investments.reduce((s, i) => s + i.invested_amount, 0);
  const totalCurrent = investments.reduce((s, i) => s + i.current_value, 0);

  return (
    <div>
      <PageHeader title="Investments" />

      <Card className="mb-4">
        <SectionHeader title="Invested vs current" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-teal-900/50">Invested</p>
            <Money amount={totalInvested} currency={household.base_currency} className="text-lg" compact />
          </div>
          <div>
            <p className="text-teal-900/50">Current value</p>
            <Money amount={totalCurrent} currency={household.base_currency} className="text-lg" compact />
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {investments.map((inv) => {
          const gain = inv.current_value - inv.invested_amount;
          return (
            <Link key={inv.id} href={`/investments/${inv.id}/edit`}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-teal-900">{inv.name}</p>
                    <p className="text-xs text-teal-900/50">
                      {ownerName(inv.owner_id)} · {inv.provider || inv.type}
                    </p>
                  </div>
                  <Badge tone="neutral">{inv.type}</Badge>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-teal-900/40">Invested</p>
                    <Money amount={inv.invested_amount} currency={inv.currency} compact />
                  </div>
                  <div>
                    <p className="text-teal-900/40">Current</p>
                    <Money amount={inv.current_value} currency={inv.currency} compact />
                  </div>
                  <div>
                    <p className="text-teal-900/40">Gain/Loss</p>
                    <Money amount={gain} currency={inv.currency} signed compact className={gain >= 0 ? 'text-emerald-500' : 'text-rose-500'} />
                  </div>
                </div>
                {inv.maturity_amount ? (
                  <p className="mt-2 text-xs text-teal-900/40">
                    Matures {inv.maturity_date || '—'} · <Money amount={inv.maturity_amount ?? 0} currency={inv.currency} compact />
                  </p>
                ) : null}
                {inv.notes && <p className="mt-2 text-xs text-teal-900/40">{inv.notes}</p>}
              </Card>
            </Link>
          );
        })}
      </div>

      <Link
        href="/investments/new"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-900/20 py-3 text-sm font-medium text-teal-900/60"
      >
        <Plus size={16} /> Add investment
      </Link>
    </div>
  );
}
