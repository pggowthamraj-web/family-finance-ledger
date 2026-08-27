import Link from 'next/link';
import { ChevronRight, Sprout, TreePalm } from 'lucide-react';
import { getFarmData } from '@/lib/supabase/queries';
import { farmSummary } from '@/lib/finance/farm';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';

export default async function FarmPage() {
  const data = await getFarmData();
  if (!data) return null;
  const { household, harvests, fertilizerApplications } = data;

  const summary = farmSummary(harvests, fertilizerApplications, household.exchange_rates);

  return (
    <div>
      <PageHeader title="Yash Coconut Farm" backHref="/more" />

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-medium text-teal-900/50">Net income</p>
          <Money
            amount={summary.net}
            currency={summary.currency}
            className={`text-xl ${summary.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
          />
        </Card>
        <Card>
          <p className="text-xs font-medium text-teal-900/50">Harvest income</p>
          <Money amount={summary.totalHarvestIncome} currency={summary.currency} className="text-xl text-emerald-500" />
        </Card>
        <Card>
          <p className="text-xs font-medium text-teal-900/50">Coconut revenue</p>
          <Money amount={summary.totalRevenue} currency={summary.currency} className="text-xl" />
        </Card>
        <Card>
          <p className="text-xs font-medium text-teal-900/50">Fertiliser & labour spend</p>
          <Money amount={summary.totalHarvestCosts + summary.totalFertilizerCost} currency={summary.currency} className="text-xl text-rose-500" />
        </Card>
      </div>

      <p className="mt-3 text-xs text-teal-900/40">
        {summary.harvestCount} harvest{summary.harvestCount === 1 ? '' : 's'} · {summary.fertilizerApplicationCount}{' '}
        fertiliser application{summary.fertilizerApplicationCount === 1 ? '' : 's'}
        {summary.lastHarvestDate && ` · last harvest ${summary.lastHarvestDate}`}
      </p>

      <div className="mt-4 divide-y divide-teal-900/[0.06] overflow-hidden rounded-2xl bg-white shadow-card">
        <Link href="/more/farm/harvests" className="flex items-center justify-between px-4 py-3.5">
          <span className="flex items-center gap-3 text-sm text-teal-900">
            <TreePalm size={18} className="text-teal-700" />
            Harvests
          </span>
          <ChevronRight size={16} className="text-teal-900/30" />
        </Link>
        <Link href="/more/farm/fertiliser" className="flex items-center justify-between px-4 py-3.5">
          <span className="flex items-center gap-3 text-sm text-teal-900">
            <Sprout size={18} className="text-teal-700" />
            Manures & Fertiliser
          </span>
          <ChevronRight size={16} className="text-teal-900/30" />
        </Link>
      </div>
    </div>
  );
}
