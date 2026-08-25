'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db, requireHousehold, genId, str, num, bool } from './helpers';
import type { ReceiptItem } from '@/lib/finance/types';

export async function createTransaction(formData: FormData) {
  const { household, member } = await requireHousehold();
  const supabase = await db();

  const type = str(formData, 'type') as 'expense' | 'income' | 'transfer';
  const toAccountId = type === 'transfer' ? str(formData, 'to_account_id') : null;

  const { error } = await supabase.from('transactions').insert({
    id: genId('t'),
    household_id: household.id,
    type,
    date: str(formData, 'date'),
    amount: num(formData, 'amount') ?? 0,
    currency: str(formData, 'currency') ?? household.base_currency,
    category_id: type === 'transfer' ? null : str(formData, 'category_id'),
    subcategory_id: type === 'transfer' ? null : str(formData, 'subcategory_id'),
    description: str(formData, 'description'),
    person_id: str(formData, 'person_id'),
    entered_by_id: member.id,
    account_id: str(formData, 'account_id'),
    to_account_id: toAccountId,
    recurring: bool(formData, 'recurring'),
    notes: str(formData, 'notes'),
    country: str(formData, 'country'),
    created_by: member.id,
    updated_by: member.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  redirect('/transactions');
}

export async function updateTransaction(id: string, formData: FormData) {
  const { member } = await requireHousehold();
  const supabase = await db();

  const type = str(formData, 'type') as 'expense' | 'income' | 'transfer';

  const { error } = await supabase
    .from('transactions')
    .update({
      type,
      date: str(formData, 'date'),
      amount: num(formData, 'amount') ?? 0,
      currency: str(formData, 'currency'),
      category_id: type === 'transfer' ? null : str(formData, 'category_id'),
      subcategory_id: type === 'transfer' ? null : str(formData, 'subcategory_id'),
      description: str(formData, 'description'),
      person_id: str(formData, 'person_id'),
      account_id: str(formData, 'account_id'),
      to_account_id: type === 'transfer' ? str(formData, 'to_account_id') : null,
      recurring: bool(formData, 'recurring'),
      notes: str(formData, 'notes'),
      country: str(formData, 'country'),
      updated_by: member.id,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  redirect('/transactions');
}

export async function deleteTransaction(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  redirect('/transactions');
}

/**
 * PROJECT_SPEC "Receipt item scanning — attach, don't duplicate": attach a
 * pasted-in items array to an existing un-itemized expense transaction
 * rather than creating a new row.
 */
export async function attachReceiptItems(transactionId: string, items: ReceiptItem[]) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('transactions').update({ items }).eq('id', transactionId);
  if (error) throw new Error(error.message);
  revalidatePath('/transactions');
  revalidatePath('/more/receipts');
}

/** Explicit "not in my statement yet" path — creates a brand new itemized expense. */
export async function createTransactionFromReceipt(
  formData: FormData,
  items: ReceiptItem[]
) {
  const { household, member } = await requireHousehold();
  const supabase = await db();

  const { error } = await supabase.from('transactions').insert({
    id: genId('t'),
    household_id: household.id,
    type: 'expense',
    date: str(formData, 'date'),
    amount: num(formData, 'amount') ?? items.reduce((s, i) => s + i.price * i.quantity, 0),
    currency: str(formData, 'currency') ?? household.base_currency,
    category_id: str(formData, 'category_id'),
    subcategory_id: str(formData, 'subcategory_id'),
    description: str(formData, 'description'),
    person_id: str(formData, 'person_id'),
    entered_by_id: member.id,
    account_id: str(formData, 'account_id'),
    notes: 'Added from receipt scan — not found in bank statement',
    country: str(formData, 'country'),
    items,
    created_by: member.id,
    updated_by: member.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}
