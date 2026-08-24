'use server';

import { revalidatePath } from 'next/cache';
import { db, requireHousehold, genId, str, num } from './helpers';

export async function createShoppingTrip(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { data, error } = await supabase
    .from('shopping_trips')
    .insert({
      id: genId('trip'),
      household_id: household.id,
      store: str(formData, 'store'),
      date: str(formData, 'date') ?? new Date().toISOString().slice(0, 10),
      currency: str(formData, 'currency') ?? household.base_currency,
      notes: str(formData, 'notes'),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/shopping');
  return data;
}

export async function deleteShoppingTrip(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('shopping_trips').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/shopping');
}

export async function addShoppingItem(tripId: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('shopping_items').insert({
    id: genId('item'),
    trip_id: tripId,
    name: str(formData, 'name'),
    quantity: num(formData, 'quantity') ?? 1,
    price: num(formData, 'price') ?? 0,
    category_id: str(formData, 'category_id'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/shopping');
}

export async function deleteShoppingItem(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('shopping_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/shopping');
}

export async function createShoppingCategory(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('shopping_categories').insert({
    id: genId('cat'),
    household_id: household.id,
    name: str(formData, 'name'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/shopping');
}
