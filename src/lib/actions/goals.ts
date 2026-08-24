'use server';

import { revalidatePath } from 'next/cache';
import { db, requireHousehold, genId, str, num } from './helpers';
import type { GoalContribution } from '@/lib/finance/types';

export async function createGoal(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('goals').insert({
    id: genId('g'),
    household_id: household.id,
    name: str(formData, 'name'),
    description: str(formData, 'description'),
    target_amount: num(formData, 'target_amount') ?? 0,
    currency: str(formData, 'currency') ?? household.base_currency,
    target_date: str(formData, 'target_date'),
    current_amount: num(formData, 'current_amount') ?? 0,
    monthly_contribution: num(formData, 'monthly_contribution') ?? 0,
    account_id: str(formData, 'account_id'),
    priority: str(formData, 'priority') ?? 'Medium',
    owner_id: str(formData, 'owner_id') ?? 'shared',
    notes: str(formData, 'notes'),
    contributions: [],
  });
  if (error) throw new Error(error.message);
  revalidatePath('/goals');
  revalidatePath('/dashboard');
}

export async function updateGoal(id: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase
    .from('goals')
    .update({
      name: str(formData, 'name'),
      description: str(formData, 'description'),
      target_amount: num(formData, 'target_amount') ?? 0,
      currency: str(formData, 'currency'),
      target_date: str(formData, 'target_date'),
      current_amount: num(formData, 'current_amount') ?? 0,
      monthly_contribution: num(formData, 'monthly_contribution') ?? 0,
      account_id: str(formData, 'account_id'),
      priority: str(formData, 'priority'),
      owner_id: str(formData, 'owner_id') ?? 'shared',
      notes: str(formData, 'notes'),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/goals');
  revalidatePath('/dashboard');
}

export async function deleteGoal(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/goals');
  revalidatePath('/dashboard');
}

export async function addGoalContribution(id: string, amount: number, date: string) {
  await requireHousehold();
  const supabase = await db();
  const { data: goal, error: fetchError } = await supabase
    .from('goals')
    .select('current_amount, contributions')
    .eq('id', id)
    .single();
  if (fetchError || !goal) throw new Error(fetchError?.message ?? 'Goal not found');

  const contributions: GoalContribution[] = [...(goal.contributions ?? []), { date, amount }];
  const { error } = await supabase
    .from('goals')
    .update({ current_amount: (goal.current_amount ?? 0) + amount, contributions })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/goals');
  revalidatePath('/dashboard');
}
