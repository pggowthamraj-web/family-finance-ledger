import { getHouseholdData, getShoppingData } from '@/lib/supabase/queries';
import { computeFrequentItems } from '@/lib/finance/groceryInsights';
import { addShoppingListItem, toggleShoppingListItem, deleteShoppingListItem } from '@/lib/actions/entities';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { X } from 'lucide-react';

export default async function ShoppingListPage() {
  const [household, shopping] = await Promise.all([getHouseholdData(), getShoppingData()]);
  if (!household || !shopping) return null;

  const suggestions = computeFrequentItems(household.transactions, shopping.items)
    .slice(0, 8)
    .filter((s) => !household.shoppingList.some((i) => i.name.toLowerCase() === s.name.toLowerCase()));

  return (
    <div>
      <PageHeader title="Shopping List" backHref="/more" />

      <form action={addShoppingListItem} className="mb-3 flex gap-2">
        <input name="name" required placeholder="Add an item" className="flex-1 rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-xl bg-teal-900 px-4 py-2 text-sm font-medium text-white">
          Add
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <form key={s.name} action={addShoppingListItem}>
              <input type="hidden" name="name" value={s.name} />
              <button type="submit" className="rounded-full bg-teal-900/[0.06] px-2.5 py-1 text-xs text-teal-900/70">
                + {s.name}
              </button>
            </form>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {household.shoppingList.map((item) => (
          <Card key={item.id} className="flex items-center justify-between py-2.5">
            <form action={toggleShoppingListItem.bind(null, item.id, !item.checked)} className="flex flex-1 items-center gap-2">
              <button type="submit" className={`h-5 w-5 rounded-full border-2 ${item.checked ? 'border-teal-700 bg-teal-700' : 'border-teal-900/20'}`} />
              <span className={`text-sm ${item.checked ? 'text-teal-900/30 line-through' : 'text-teal-900'}`}>{item.name}</span>
            </form>
            <form action={deleteShoppingListItem.bind(null, item.id)}>
              <button className="text-teal-900/30">
                <X size={16} />
              </button>
            </form>
          </Card>
        ))}
        {household.shoppingList.length === 0 && <p className="text-sm text-teal-900/50">Your list is empty.</p>}
      </div>
    </div>
  );
}
