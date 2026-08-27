'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db, requireHousehold, genId, str, num } from './helpers';

// --- harvests --------------------------------------------------------------
export async function createFarmHarvest(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('farm_harvests').insert({
    id: genId('fh'),
    household_id: household.id,
    harvest_date: str(formData, 'harvest_date'),
    trees_harvested: num(formData, 'trees_harvested') ?? 0,
    small_coconuts_count: num(formData, 'small_coconuts_count') ?? 0,
    small_coconut_price: num(formData, 'small_coconut_price') ?? 0,
    big_coconuts_count: num(formData, 'big_coconuts_count') ?? 0,
    big_coconut_price: num(formData, 'big_coconut_price') ?? 0,
    watchman_salary: num(formData, 'watchman_salary') ?? 0,
    labour_charges: num(formData, 'labour_charges') ?? 0,
    currency: str(formData, 'currency') ?? 'INR',
    performed_by: str(formData, 'performed_by'),
    notes: str(formData, 'notes'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/farm');
  revalidatePath('/more/farm/harvests');
  redirect('/more/farm/harvests');
}

export async function updateFarmHarvest(id: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase
    .from('farm_harvests')
    .update({
      harvest_date: str(formData, 'harvest_date'),
      trees_harvested: num(formData, 'trees_harvested') ?? 0,
      small_coconuts_count: num(formData, 'small_coconuts_count') ?? 0,
      small_coconut_price: num(formData, 'small_coconut_price') ?? 0,
      big_coconuts_count: num(formData, 'big_coconuts_count') ?? 0,
      big_coconut_price: num(formData, 'big_coconut_price') ?? 0,
      watchman_salary: num(formData, 'watchman_salary') ?? 0,
      labour_charges: num(formData, 'labour_charges') ?? 0,
      currency: str(formData, 'currency'),
      performed_by: str(formData, 'performed_by'),
      notes: str(formData, 'notes'),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/farm');
  revalidatePath('/more/farm/harvests');
  redirect('/more/farm/harvests');
}

export async function deleteFarmHarvest(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('farm_harvests').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/farm');
  revalidatePath('/more/farm/harvests');
  redirect('/more/farm/harvests');
}

// --- fertiliser / manure applications ---------------------------------------
export async function createFarmFertilizerApplication(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('farm_fertilizer_applications').insert({
    id: genId('ff'),
    household_id: household.id,
    application_date: str(formData, 'application_date'),
    trees_count: num(formData, 'trees_count') ?? 0,
    fertilizer_cost_per_tree: num(formData, 'fertilizer_cost_per_tree') ?? 0,
    labour_cost_per_tree: num(formData, 'labour_cost_per_tree') ?? 0,
    currency: str(formData, 'currency') ?? 'INR',
    performed_by: str(formData, 'performed_by'),
    notes: str(formData, 'notes'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/farm');
  revalidatePath('/more/farm/fertiliser');
  redirect('/more/farm/fertiliser');
}

export async function updateFarmFertilizerApplication(id: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase
    .from('farm_fertilizer_applications')
    .update({
      application_date: str(formData, 'application_date'),
      trees_count: num(formData, 'trees_count') ?? 0,
      fertilizer_cost_per_tree: num(formData, 'fertilizer_cost_per_tree') ?? 0,
      labour_cost_per_tree: num(formData, 'labour_cost_per_tree') ?? 0,
      currency: str(formData, 'currency'),
      performed_by: str(formData, 'performed_by'),
      notes: str(formData, 'notes'),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/farm');
  revalidatePath('/more/farm/fertiliser');
  redirect('/more/farm/fertiliser');
}

export async function deleteFarmFertilizerApplication(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('farm_fertilizer_applications').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/farm');
  revalidatePath('/more/farm/fertiliser');
  redirect('/more/farm/fertiliser');
}
