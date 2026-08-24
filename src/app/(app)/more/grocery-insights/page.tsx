import { getHouseholdData, getShoppingData } from '@/lib/supabase/queries';
import { computeFrequentItems, spendByStore } from '@/lib/finance/groceryInsights';
import { PageHeader } from '@/components/PageHeader';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';

export default async function GroceryInsightsPage() {
  const [household, shopping] = await Promise.all([getHouseholdData(), getShoppingData()]);
  if (!household || !shopping) return null;

  const frequent = computeFrequentItems(household.transactions, shopping.items).slice(0, 20);
  const stores = spendByStore(shopping.trips, shopping.items);

  return (
    <div>
      <PageHeader title="Grocery Insights" backHref="/more" />

      <Card className="mb-4">
        <SectionHeader title="Frequently bought" />
        <div className="space-y-2">
          {frequent.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <span className="text-teal-900/80 line-clamp-1">{item.name}</span>
              <span className="whitespace-nowrap text-xs text-teal-900/50">
                ×{item.timesPurchased} · <Money amount={item.totalSpend} currency={household.household.base_currency} compact />
              </span>
            </div>
          ))}
          {frequent.length === 0 && <p className="text-sm text-teal-900/50">No itemized purchases yet.</p>}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Spend by store" />
        <div className="space-y-2">
          {stores.map((s) => (
            <div key={s.store} className="flex items-center justify-between text-sm">
              <span className="text-teal-900/80">
                {s.store} <span className="text-xs text-teal-900/40">({s.trips} trip{s.trips === 1 ? '' : 's'})</span>
              </span>
              <Money amount={s.total} currency={household.household.base_currency} compact />
            </div>
          ))}
          {stores.length === 0 && <p className="text-sm text-teal-900/50">No shopping trips logged yet.</p>}
        </div>
      </Card>
    </div>
  );
}
