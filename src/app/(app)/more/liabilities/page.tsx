import Link from 'next/link';
import { getHouseholdData } from '@/lib/supabase/queries';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { Badge } from '@/components/ui/Badge';
import { Plus } from 'lucide-react';

export default async function LiabilitiesPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const ownerName = (id: string | null) => data.members.find((m) => m.id === id)?.name ?? 'Unassigned';

  return (
    <div>
      <PageHeader title="Liabilities" backHref="/more" />
      <div className="space-y-3">
        {data.liabilities.map((l) => (
          <Link key={l.id} href={`/more/liabilities/${l.id}/edit`}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-teal-900">{l.name}</p>
                  <p className="text-xs text-teal-900/50">
                    {l.type} · {ownerName(l.person_id)}
                  </p>
                </div>
                <Money amount={l.current_amount} currency={l.currency} compact className="text-rose-500" />
              </div>
              {l.is_unconfirmed && (
                <Badge tone="amber" className="mt-2">
                  Unconfirmed — not verified against a statement
                </Badge>
              )}
              {l.notes && <p className="mt-2 text-xs text-teal-900/40 line-clamp-2">{l.notes}</p>}
            </Card>
          </Link>
        ))}
      </div>
      <Link href="/more/liabilities/new" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-900/20 py-3 text-sm font-medium text-teal-900/60">
        <Plus size={16} /> Add liability
      </Link>
    </div>
  );
}
