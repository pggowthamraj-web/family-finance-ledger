'use client';

import { useMemo, useState } from 'react';
import type { ShoppingData } from '@/lib/supabase/queries';
import { spendByStore } from '@/lib/finance/groceryInsights';
import {
  createShoppingTrip,
  addShoppingItem,
  deleteShoppingItem,
  deleteShoppingTrip,
} from '@/lib/actions/shopping';
import { PageHeader } from '@/components/PageHeader';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

export function ShoppingClient({ shopping, baseCurrency }: { shopping: ShoppingData; baseCurrency: string }) {
  const { trips, items, categories } = shopping;
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(trips[0]?.id ?? null);

  const itemsByTrip = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const list = map.get(item.trip_id) ?? [];
      list.push(item);
      map.set(item.trip_id, list);
    }
    return map;
  }, [items]);

  const tripTotal = (tripId: string) => (itemsByTrip.get(tripId) ?? []).reduce((s, i) => s + i.price * i.quantity, 0);

  const totalSpend = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthSpend = trips
    .filter((t) => t.date.startsWith(thisMonth))
    .reduce((s, t) => s + tripTotal(t.id), 0);

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const item of items) {
      const key = item.category_id ?? 'uncategorized';
      totals.set(key, (totals.get(key) ?? 0) + item.price * item.quantity);
    }
    const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';
    return [...totals.entries()].map(([id, total]) => ({ name: catName(id), total })).sort((a, b) => b.total - a.total);
  }, [items, categories]);

  const stores = spendByStore(trips, items);

  return (
    <div>
      <PageHeader
        title="Shopping Tracker"
        action={
          <button onClick={() => setShowNewTrip((s) => !s)} className="flex items-center gap-1 rounded-full bg-teal-900 px-3 py-1.5 text-xs font-medium text-white">
            <Plus size={14} /> Trip
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-medium text-teal-900/50">This month</p>
          <Money amount={monthSpend} currency={baseCurrency} className="text-lg" compact />
        </Card>
        <Card>
          <p className="text-xs font-medium text-teal-900/50">All time</p>
          <Money amount={totalSpend} currency={baseCurrency} className="text-lg" compact />
        </Card>
      </div>

      {showNewTrip && (
        <Card className="mb-4">
          <SectionHeader title="New trip" />
          <form action={createShoppingTrip} className="space-y-2">
            <input name="store" required placeholder="Store" className={inputClass} />
            <input type="date" name="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} />
            <select name="currency" defaultValue={baseCurrency} className={inputClass}>
              <option value={baseCurrency}>{baseCurrency}</option>
            </select>
            <input name="notes" placeholder="Notes (optional)" className={inputClass} />
            <button type="submit" className="w-full rounded-xl bg-teal-900 py-2.5 text-sm font-medium text-white">
              Start trip
            </button>
          </form>
        </Card>
      )}

      <Card className="mb-4">
        <SectionHeader title="Spend by category" />
        <div className="space-y-1.5">
          {categoryTotals.slice(0, 6).map((c) => (
            <div key={c.name} className="flex justify-between text-sm">
              <span className="text-teal-900/70">{c.name}</span>
              <Money amount={c.total} currency={baseCurrency} compact />
            </div>
          ))}
          {categoryTotals.length === 0 && <p className="text-sm text-teal-900/50">No items logged yet.</p>}
        </div>
      </Card>

      <Card className="mb-4">
        <SectionHeader title="Spend by store" />
        <div className="space-y-1.5">
          {stores.slice(0, 6).map((s) => (
            <div key={s.store} className="flex justify-between text-sm">
              <span className="text-teal-900/70">{s.store}</span>
              <Money amount={s.total} currency={baseCurrency} compact />
            </div>
          ))}
        </div>
      </Card>

      <SectionHeader title="Trips" />
      <div className="space-y-3">
        {trips.map((trip) => {
          const tripItems = itemsByTrip.get(trip.id) ?? [];
          const expanded = expandedTrip === trip.id;
          return (
            <Card key={trip.id}>
              <button onClick={() => setExpandedTrip(expanded ? null : trip.id)} className="flex w-full items-center justify-between">
                <div className="text-left">
                  <p className="font-medium text-teal-900">{trip.store}</p>
                  <p className="text-xs text-teal-900/50">
                    {trip.date} · {tripItems.length} items
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Money amount={tripTotal(trip.id)} currency={trip.currency} compact />
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {expanded && (
                <div className="mt-3 space-y-2 border-t border-teal-900/[0.06] pt-3">
                  {tripItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-teal-900/80">
                        {item.quantity}× {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Money amount={item.price * item.quantity} currency={trip.currency} compact />
                        <form action={deleteShoppingItem.bind(null, item.id)}>
                          <button className="text-teal-900/30">
                            <X size={14} />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}

                  <form action={addShoppingItem.bind(null, trip.id)} className="flex flex-wrap gap-1.5 pt-1">
                    <input name="name" required placeholder="Item name" className="min-w-0 flex-[2] rounded-lg border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-xs" />
                    <input type="number" step="1" min="1" name="quantity" defaultValue={1} className="w-14 rounded-lg border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-xs" />
                    <input type="number" step="0.01" name="price" required placeholder="Price" className="w-20 rounded-lg border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-xs" />
                    <select name="category_id" className="flex-1 rounded-lg border border-teal-900/10 bg-teal-50/50 px-2 py-1.5 text-xs">
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-lg bg-teal-900 px-3 py-1.5 text-xs font-medium text-white">
                      Add
                    </button>
                  </form>

                  <form action={deleteShoppingTrip.bind(null, trip.id)}>
                    <button className="mt-1 text-xs font-medium text-rose-500">Delete trip</button>
                  </form>
                </div>
              )}
            </Card>
          );
        })}
        {trips.length === 0 && <p className="text-sm text-teal-900/50">No trips logged yet.</p>}
      </div>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 text-sm text-teal-900';
