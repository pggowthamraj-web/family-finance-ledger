import Link from 'next/link';
import { Plus, Sprout } from 'lucide-react';
import { getFarmData } from '@/lib/supabase/queries';
import { fertilizerApplicationCost } from '@/lib/finance/farm';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';

export default async function FertiliserPage() {
  const data = await getFarmData();
  if (!data) return null;
  const { fertilizerApplications } = data;

  return (
    <div>
      <PageHeader title="Manures & Fertiliser" backHref="/more/farm" />

      <div className="space-y-2">
        {fertilizerApplications.map((f) => (
          <Link key={f.id} href={`/more/farm/fertiliser/${f.id}/edit`} className="block">
            <Card className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-900/[0.08]">
                  <Sprout size={16} className="text-teal-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-teal-900">{f.application_date}</p>
                  <p className="mt-0.5 truncate text-xs text-teal-900/50">
                    {f.trees_count} trees
                    {f.performed_by ? ` · ${f.performed_by}` : ''}
                  </p>
                </div>
              </div>
              <Money
                amount={fertilizerApplicationCost(f)}
                currency={f.currency}
                className="flex-shrink-0 whitespace-nowrap text-rose-500"
              />
            </Card>
          </Link>
        ))}
        {fertilizerApplications.length === 0 && (
          <p className="py-8 text-center text-sm text-teal-900/40">No fertiliser applications recorded yet.</p>
        )}
      </div>

      <Link
        href="/more/farm/fertiliser/new"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-900/20 py-3 text-sm font-medium text-teal-900/60"
      >
        <Plus size={16} /> Add application
      </Link>
    </div>
  );
}
