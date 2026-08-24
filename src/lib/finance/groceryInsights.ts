import type { ReceiptItem, Transaction } from './types';
import type { ShoppingItem, ShoppingTrip } from './types';

export interface ItemInsight {
  name: string;
  timesPurchased: number;
  totalQuantity: number;
  totalSpend: number; // in whatever currency each purchase was — summed loosely for a "frequency" view, not a financial total
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * PROJECT_SPEC: "Suggest frequently-bought items (aggregated from receipt
 * `items`)". Pulls from both itemized bank-statement transactions and the
 * companion shopping tracker, since both represent real purchases.
 */
export function computeFrequentItems(
  transactions: Pick<Transaction, 'items'>[],
  shoppingItems: ShoppingItem[]
): ItemInsight[] {
  const byName = new Map<string, ItemInsight & { displayName: string }>();

  const record = (item: { name: string; quantity: number; price: number }) => {
    const key = normalizeName(item.name);
    if (!key) return;
    const existing = byName.get(key);
    if (existing) {
      existing.timesPurchased += 1;
      existing.totalQuantity += item.quantity;
      existing.totalSpend += item.price * item.quantity;
    } else {
      byName.set(key, {
        name: key,
        displayName: item.name,
        timesPurchased: 1,
        totalQuantity: item.quantity,
        totalSpend: item.price * item.quantity,
      });
    }
  };

  for (const t of transactions) {
    for (const item of (t.items ?? []) as ReceiptItem[]) record(item);
  }
  for (const item of shoppingItems) record(item);

  return [...byName.values()]
    .map((v) => ({ name: v.displayName, timesPurchased: v.timesPurchased, totalQuantity: v.totalQuantity, totalSpend: v.totalSpend }))
    .sort((a, b) => b.timesPurchased - a.timesPurchased);
}

export interface StoreSpend {
  store: string;
  total: number;
  trips: number;
}

export function spendByStore(trips: ShoppingTrip[], items: ShoppingItem[]): StoreSpend[] {
  const totals = new Map<string, { total: number; trips: Set<string> }>();
  const tripById = new Map(trips.map((t) => [t.id, t]));
  for (const item of items) {
    const trip = tripById.get(item.trip_id);
    if (!trip) continue;
    const entry = totals.get(trip.store) ?? { total: 0, trips: new Set<string>() };
    entry.total += item.price * item.quantity;
    entry.trips.add(trip.id);
    totals.set(trip.store, entry);
  }
  return [...totals.entries()]
    .map(([store, { total, trips }]) => ({ store, total, trips: trips.size }))
    .sort((a, b) => b.total - a.total);
}
