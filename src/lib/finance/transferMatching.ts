import type { Account } from './types';

/**
 * PROJECT_SPEC "Avoiding double-counted transfers" — for re-importing future
 * bank statements (the already-imported data was matched once when the seed
 * was built; this module reproduces the same behavior for new statements).
 *
 * A minimal raw-statement-line shape, before any transaction row exists yet.
 */
export interface RawStatementLine {
  date: string; // yyyy-mm-dd
  amount: number; // always positive
  direction: 'out' | 'in';
  description: string;
  accountId: string;
  personId: string;
}

export interface MatchedTransferPair {
  outLine: RawStatementLine;
  inLine: RawStatementLine;
}

/**
 * Match by date + amount across both people's raw lines: an outflow on one
 * statement paired with an inflow on the other, same date, same amount,
 * becomes a single `transfer` row instead of two expense/income rows.
 * Unmatched one-sided lines are left as-is for the caller to categorize
 * normally (e.g. into "Family Transfers").
 */
export function matchInterPersonTransfers(lines: RawStatementLine[]): {
  matched: MatchedTransferPair[];
  unmatched: RawStatementLine[];
} {
  const outs = lines.filter((l) => l.direction === 'out');
  const ins = lines.filter((l) => l.direction === 'in');
  const usedIns = new Set<RawStatementLine>();
  const matched: MatchedTransferPair[] = [];
  const unmatchedOuts: RawStatementLine[] = [];

  for (const outLine of outs) {
    const candidate = ins.find(
      (inLine) =>
        !usedIns.has(inLine) &&
        inLine.date === outLine.date &&
        inLine.amount === outLine.amount &&
        inLine.personId !== outLine.personId
    );
    if (candidate) {
      usedIns.add(candidate);
      matched.push({ outLine, inLine: candidate });
    } else {
      unmatchedOuts.push(outLine);
    }
  }

  const unmatchedIns = ins.filter((l) => !usedIns.has(l));
  return { matched, unmatched: [...unmatchedOuts, ...unmatchedIns] };
}

/**
 * A person's payment to their *own* credit card, matched by card number
 * appearing in the current-account statement line, becomes a `transfer` to
 * that credit-card account rather than a duplicate expense. Since we don't
 * OCR card numbers here, the practical signal is: same person, same date,
 * an outflow on a non-credit account whose amount matches an inflow
 * (payment received) on their own credit card account within the same
 * statement batch.
 */
export function matchOwnCreditCardPayments(
  lines: RawStatementLine[],
  accounts: Pick<Account, 'id' | 'type' | 'owner_id'>[]
): { matched: MatchedTransferPair[]; unmatched: RawStatementLine[] } {
  const creditCardAccountIds = new Set(
    accounts.filter((a) => a.type === 'Credit Card').map((a) => a.id)
  );
  const outs = lines.filter((l) => l.direction === 'out' && !creditCardAccountIds.has(l.accountId));
  const ins = lines.filter((l) => l.direction === 'in' && creditCardAccountIds.has(l.accountId));
  const usedIns = new Set<RawStatementLine>();
  const matched: MatchedTransferPair[] = [];
  const unmatchedOuts: RawStatementLine[] = [];

  for (const outLine of outs) {
    const candidate = ins.find(
      (inLine) =>
        !usedIns.has(inLine) &&
        inLine.date === outLine.date &&
        inLine.amount === outLine.amount &&
        inLine.personId === outLine.personId &&
        accounts.find((a) => a.id === inLine.accountId)?.owner_id === outLine.personId
    );
    if (candidate) {
      usedIns.add(candidate);
      matched.push({ outLine, inLine: candidate });
    } else {
      unmatchedOuts.push(outLine);
    }
  }

  const unmatchedIns = ins.filter((l) => !usedIns.has(l));
  return { matched, unmatched: [...unmatchedOuts, ...unmatchedIns] };
}
