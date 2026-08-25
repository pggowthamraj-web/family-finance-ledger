'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db, requireHousehold, genId, str, num } from './helpers';
import { insertTransaction } from './transactions';

export async function createAccount(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('accounts').insert({
    id: genId('a'),
    household_id: household.id,
    name: str(formData, 'name'),
    type: str(formData, 'type'),
    currency: str(formData, 'currency') ?? household.base_currency,
    balance: num(formData, 'balance') ?? 0,
    owner_id: str(formData, 'owner_id'),
    country: str(formData, 'country'),
    notes: str(formData, 'notes'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/accounts');
  redirect('/accounts');
}

export async function updateAccount(id: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase
    .from('accounts')
    .update({
      name: str(formData, 'name'),
      type: str(formData, 'type'),
      currency: str(formData, 'currency'),
      balance: num(formData, 'balance') ?? 0,
      owner_id: str(formData, 'owner_id'),
      country: str(formData, 'country'),
      notes: str(formData, 'notes'),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/accounts');
  redirect('/accounts');
}

export async function deleteAccount(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/accounts');
  redirect('/accounts');
}

/**
 * Transfer between two of the household's own accounts — a single
 * `transaction` row of type 'transfer', never counted as income/expense.
 */
export async function transferBetweenAccounts(formData: FormData) {
  const { household } = await requireHousehold();
  const fromId = str(formData, 'account_id');
  const toId = str(formData, 'to_account_id');
  if (!fromId || !toId || fromId === toId) {
    throw new Error('Choose two different accounts to transfer between.');
  }

  const wrapped = new FormData();
  wrapped.set('type', 'transfer');
  wrapped.set('date', str(formData, 'date') ?? new Date().toISOString().slice(0, 10));
  wrapped.set('amount', String(num(formData, 'amount') ?? 0));
  wrapped.set('currency', str(formData, 'currency') ?? household.base_currency);
  wrapped.set('description', str(formData, 'description') ?? 'Transfer');
  if (str(formData, 'person_id')) wrapped.set('person_id', str(formData, 'person_id')!);
  wrapped.set('account_id', fromId);
  wrapped.set('to_account_id', toId);
  if (str(formData, 'notes')) wrapped.set('notes', str(formData, 'notes')!);

  await insertTransaction(wrapped);
  revalidatePath('/accounts');
  redirect('/accounts');
}
