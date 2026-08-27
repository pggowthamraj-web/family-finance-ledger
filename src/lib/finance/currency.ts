// Currency metadata is a small fixed list (not a DB table — PROJECT_SPEC's
// data model doesn't define one; only `households.exchange_rates` is
// persisted, and that's the household's editable rate map).

export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export function currencySymbol(code: string, rates?: Record<string, number>): string {
  const known = CURRENCIES.find((c) => c.code === code);
  if (known) return known.symbol;
  // extensible: an admin-added currency without a known symbol just shows its code
  return rates && code in rates ? code : code;
}

/**
 * Convert `amount` (in `fromCurrency`) into the household's base currency.
 * `rates` is the household's exchange_rates map: { CODE: rateAgainstBase }.
 * Never mutates or overwrites the original transaction amount/currency —
 * this is purely a display/aggregation-time calculation (PROJECT_SPEC
 * "Multi-currency rule").
 */
export function convertToBase(
  amount: number,
  fromCurrency: string,
  rates: Record<string, number>
): number {
  const rate = rates[fromCurrency];
  if (rate === undefined || rate === null || rate === 0) {
    // Unknown currency in the rate map — safest fallback is 1:1 rather than
    // silently dropping the amount from totals.
    return amount;
  }
  return amount * rate;
}

/**
 * Convert `amount` from `fromCurrency` into any `toCurrency` (not just the
 * household's base), by going via base currency: amount -> base -> target.
 * `rates` is still the household's { CODE: rateAgainstBase } map. Falls back
 * to the base-currency value if `toCurrency` isn't in the rate map, rather
 * than dividing by zero/undefined.
 */
export function convertToCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  const inBase = convertToBase(amount, fromCurrency, rates);
  const toRate = rates[toCurrency];
  if (!toRate) return inBase;
  return inBase / toRate;
}

export function formatMoney(amount: number, currency: string, rates?: Record<string, number>): string {
  const symbol = currencySymbol(currency, rates);
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}
