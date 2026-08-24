import Link from 'next/link';
import { getHouseholdData } from '@/lib/supabase/queries';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeftRight, Plus } from 'lucide-react';

const TYPE_TONE: Record<string, 'neutral' | 'amber' | 'rose' | 'emerald'> = {
  'Credit Card': 'rose',
  'Savings Account': 'emerald',
};

export default async function AccountsPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const { accounts, members, household } = data;

  const memberName = (id: string | null) => members.find((m) => m.id === id)?.name ?? 'Household';

  return (
    <div>
      <PageHeader
        title="Accounts"
        action={
          <Link href="/accounts/transfer" className="flex items-center gap-1 rounded-full bg-teal-900/[0.06] px-3 py-1.5 text-xs font-medium text-teal-900">
            <ArrowLeftRight size={14} /> Transfer
          </Link>
        }
      />

      <div className="space-y-3">
        {accounts.map((a) => (
          <Link key={a.id} href={`/accounts/${a.id}/edit`}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-teal-900">{a.name}</p>
                  <p className="text-xs text-teal-900/50">
                    {memberName(a.owner_id)} · {a.type}
                    {a.country ? ` · ${a.country}` : ''}
                  </p>
                </div>
                <Money
                  amount={a.balance}
                  currency={a.currency}
                  className={`text-lg ${a.type === 'Credit Card' ? 'text-rose-500' : 'text-teal-900'}`}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TYPE_TONE[a.type] && <Badge tone={TYPE_TONE[a.type]}>{a.type}</Badge>}
                {a.is_derived_placeholder && <Badge tone="amber">Derived placeholder — not a verified balance</Badge>}
              </div>
              {a.notes && <p className="mt-2 text-xs text-teal-900/50">{a.notes}</p>}
            </Card>
          </Link>
        ))}
      </div>

      <Link
        href="/accounts/new"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-900/20 py-3 text-sm font-medium text-teal-900/60"
      >
        <Plus size={16} /> Add account
      </Link>

      <p className="mt-4 text-center text-xs text-teal-900/40">
        Base currency {household.base_currency} — balances above are shown in their own account currency.
      </p>
    </div>
  );
}
