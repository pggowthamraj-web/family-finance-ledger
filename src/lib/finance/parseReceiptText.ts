import type { ReceiptItem } from './types';

/**
 * Parses pasted receipt text into line items. Accepts either:
 *  - "Name  qty  price" / "Name  price" per line (whitespace-separated,
 *    price is the last numeric token, an optional integer right before it
 *    is treated as quantity)
 *  - CSV-ish "Name, qty, price"
 * Best-effort and forgiving — this feeds a review step in the UI before
 * anything is saved, so false positives are cheap to fix by hand.
 */
export function parseReceiptText(raw: string): ReceiptItem[] {
  const items: ReceiptItem[] = [];

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const parts = line.includes(',') ? line.split(',').map((p) => p.trim()) : line.split(/\s{2,}|\t/).map((p) => p.trim());
    const numeric = (s: string) => {
      const n = Number(s.replace(/[£$€₹,]/g, ''));
      return Number.isNaN(n) ? null : n;
    };

    if (parts.length >= 3 && numeric(parts[1]) !== null && numeric(parts[2]) !== null) {
      items.push({ name: parts[0], quantity: numeric(parts[1]) || 1, price: numeric(parts[2]) || 0 });
      continue;
    }
    if (parts.length === 2 && numeric(parts[1]) !== null) {
      items.push({ name: parts[0], quantity: 1, price: numeric(parts[1]) || 0 });
      continue;
    }

    // Fallback: split on trailing numbers within a single-spaced line,
    // e.g. "Tesco British Whole Milk 2.272L 4 Pints  2  3.50"
    const match = line.match(/^(.*\D)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/);
    if (match) {
      items.push({ name: match[1].trim(), quantity: Number(match[2]), price: Number(match[3]) });
      continue;
    }
    const single = line.match(/^(.*\D)\s+(\d+(?:\.\d+)?)$/);
    if (single) {
      items.push({ name: single[1].trim(), quantity: 1, price: Number(single[2]) });
      continue;
    }

    // Couldn't parse — keep the raw line as a zero-price item so nothing is silently dropped.
    items.push({ name: line, quantity: 1, price: 0 });
  }

  return items;
}
