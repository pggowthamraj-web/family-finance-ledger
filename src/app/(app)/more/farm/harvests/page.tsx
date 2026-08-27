import Link from 'next/link';
import { Plus, TreePalm } from 'lucide-react';
import { getFarmData } from '@/lib/supabase/queries';
import { harvestIncome } from '@/lib/finance/farm';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';

export default async function HarvestsPage() {
  const data = await getFarmData();
  if (!data) return null;
  const { harvests } = data;

  return (
    <div>
      <PageHeader title="Harvests" backHref="/more/farm" />

      <div className="space-y-2">
        {harvests.map((h) => {
          const income = harvestIncome(h);
          return (
            <Link key={h.id} href={`/more/farm/harvests/${h.id}/edit`} className="block">
              <Card className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-900/[0.08]">
                    <TreePalm size={16} className="text-teal-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-teal-900">{h.harvest_date}</p>
                    <p className="mt-0.5 truncate text-xs text-teal-900/50">
                      {h.trees_harvested} trees · {h.small_coconuts_count} small + {h.big_coconuts_count} big
                      {h.performed_by ? ` · ${h.performed_by}` : ''}
                    </p>
                  </div>
                </div>
                <Money
                  amount={income}
                  currency={h.currency}
                  signed
                  className={`flex-shrink-0 whitespace-nowrap ${income >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                />
              </Card>
            </Link>
          );
        })}
        {harvests.length === 0 && <p className="py-8 text-center text-sm text-teal-900/40">No harvests recorded yet.</p>}
      </div>

      <Link
        href="/more/farm/harvests/new"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-900/20 py-3 text-sm font-medium text-teal-900/60"
      >
        <Plus size={16} /> Add harvest
      </Link>
    </div>
  );
}
