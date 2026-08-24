import Link from 'next/link';
import { getHouseholdData } from '@/lib/supabase/queries';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { Plus } from 'lucide-react';

export default async function AssetsPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const ownerName = (id: string | null) => data.members.find((m) => m.id === id)?.name ?? 'Shared';

  return (
    <div>
      <PageHeader title="Assets" backHref="/more" />
      <div className="space-y-3">
        {data.assets.map((a) => (
          <Link key={a.id} href={`/more/assets/${a.id}/edit`}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-teal-900">{a.name}</p>
                  <p className="text-xs text-teal-900/50">
                    {a.type} · {ownerName(a.owner_id)}
                    {a.country ? ` · ${a.country}` : ''}
                  </p>
                </div>
                <Money amount={a.current_value} currency={a.currency} compact />
              </div>
              {a.notes && <p className="mt-2 text-xs text-teal-900/40">{a.notes}</p>}
            </Card>
          </Link>
        ))}
      </div>
      <Link href="/more/assets/new" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-900/20 py-3 text-sm font-medium text-teal-900/60">
        <Plus size={16} /> Add asset
      </Link>
    </div>
  );
}
