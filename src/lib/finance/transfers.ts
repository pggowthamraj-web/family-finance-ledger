import type { Transaction } from './types';

/**
 * PROJECT_SPEC: "Transfers are not expenses or income." Any income/expense
 * total, cash-flow figure, category breakdown, etc. must exclude
 * `type: 'transfer'` rows. Keep every aggregate going through this filter
 * rather than re-checking `type !== 'transfer'` ad hoc at each call site.
 */
export function excludeTransfers(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.type !== 'transfer');
}

export function onlyTransfers(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.type === 'transfer');
}

export function isTransfer(t: Pick<Transaction, 'type'>): boolean {
  return t.type === 'transfer';
}
