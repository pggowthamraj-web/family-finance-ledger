import type { ReceiptItem, Transaction } from './types';

/**
 * PROJECT_SPEC "Receipt item scanning — attach, don't duplicate": a scanned
 * receipt usually corresponds to a purchase already present as a lump-sum
 * expense from the bank statement import. Default behavior is to search
 * existing un-itemized expense transactions for a close match (similar
 * date, similar total) and attach the items array to *that* transaction —
 * never create a new one unless the user explicitly says "not in my
 * statement yet."
 */
export interface ReceiptMatchCandidate {
  transaction: Transaction;
  daysApart: number;
  amountDiff: number;
  score: number; // lower is better
}

export function findReceiptMatchCandidates(
  receiptDate: string,
  receiptTotal: number,
  existingTransactions: Transaction[],
  opts?: { maxDaysApart?: number; maxAmountDiffFraction?: number }
): ReceiptMatchCandidate[] {
  const maxDaysApart = opts?.maxDaysApart ?? 3;
  const maxAmountDiffFraction = opts?.maxAmountDiffFraction ?? 0.05; // 5%

  const receiptDateMs = new Date(receiptDate).getTime();

  const candidates: ReceiptMatchCandidate[] = [];
  for (const t of existingTransactions) {
    if (t.type !== 'expense') continue;
    if (t.items && t.items.length > 0) continue; // already itemized
    const daysApart = Math.abs(new Date(t.date).getTime() - receiptDateMs) / 86_400_000;
    if (daysApart > maxDaysApart) continue;
    const amountDiff = Math.abs(t.amount - receiptTotal);
    const allowedDiff = Math.max(0.5, receiptTotal * maxAmountDiffFraction);
    if (amountDiff > allowedDiff) continue;
    const score = daysApart * 10 + amountDiff; // days apart weighted heavier than pennies
    candidates.push({ transaction: t, daysApart, amountDiff, score });
  }

  return candidates.sort((a, b) => a.score - b.score);
}

export function receiptItemsTotal(items: ReceiptItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
