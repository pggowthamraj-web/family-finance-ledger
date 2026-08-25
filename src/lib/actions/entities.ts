'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db, requireHousehold, genId, str, num, bool } from './helpers';

// --- categories -------------------------------------------------------
export async function createCategory(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('categories').insert({
    id: genId('cat'),
    household_id: household.id,
    name: str(formData, 'name'),
    icon: str(formData, 'icon') ?? 'Circle',
    sort_order: 999,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/categories');
}

export async function deleteCategory(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/categories');
}

export async function createSubcategory(categoryId: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('subcategories').insert({
    id: genId('sub'),
    category_id: categoryId,
    name: str(formData, 'name'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/categories');
}

export async function deleteSubcategory(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('subcategories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/categories');
}

// --- recurring transactions --------------------------------------------
export async function createRecurring(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('recurring_transactions').insert({
    id: genId('r'),
    household_id: household.id,
    description: str(formData, 'description'),
    amount: num(formData, 'amount') ?? 0,
    currency: str(formData, 'currency') ?? household.base_currency,
    category_id: str(formData, 'category_id'),
    subcategory_id: str(formData, 'subcategory_id'),
    frequency: str(formData, 'frequency') ?? 'monthly',
    account_id: str(formData, 'account_id'),
    person_id: str(formData, 'person_id'),
    active: true,
    type: str(formData, 'type') ?? 'expense',
    notes: str(formData, 'notes'),
    start_date: str(formData, 'start_date'),
    end_date: str(formData, 'end_date'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/recurring');
  revalidatePath('/dashboard');
}

export async function updateRecurring(id: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase
    .from('recurring_transactions')
    .update({
      description: str(formData, 'description'),
      amount: num(formData, 'amount') ?? 0,
      currency: str(formData, 'currency'),
      category_id: str(formData, 'category_id'),
      subcategory_id: str(formData, 'subcategory_id'),
      frequency: str(formData, 'frequency'),
      account_id: str(formData, 'account_id'),
      person_id: str(formData, 'person_id'),
      active: bool(formData, 'active'),
      type: str(formData, 'type'),
      notes: str(formData, 'notes'),
      start_date: str(formData, 'start_date'),
      end_date: str(formData, 'end_date'),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/recurring');
  revalidatePath('/dashboard');
}

export async function deleteRecurring(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/recurring');
  revalidatePath('/dashboard');
}

// --- assets --------------------------------------------------------------
export async function createAsset(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('assets').insert({
    id: genId('as'),
    household_id: household.id,
    name: str(formData, 'name'),
    type: str(formData, 'type'),
    owner_id: str(formData, 'owner_id'),
    purchase_date: str(formData, 'purchase_date'),
    purchase_value: num(formData, 'purchase_value') ?? 0,
    current_value: num(formData, 'current_value') ?? 0,
    currency: str(formData, 'currency') ?? household.base_currency,
    country: str(formData, 'country'),
    notes: str(formData, 'notes'),
    valuation_history: [],
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/assets');
  revalidatePath('/dashboard');
  redirect('/more/assets');
}

export async function updateAsset(id: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { data: existing } = await supabase.from('assets').select('valuation_history, current_value').eq('id', id).single();
  const newValue = num(formData, 'current_value') ?? 0;
  const history = existing?.valuation_history ?? [];
  const valuationHistory =
    existing && existing.current_value !== newValue
      ? [...history, { date: new Date().toISOString().slice(0, 10), value: newValue }]
      : history;

  const { error } = await supabase
    .from('assets')
    .update({
      name: str(formData, 'name'),
      type: str(formData, 'type'),
      owner_id: str(formData, 'owner_id'),
      purchase_date: str(formData, 'purchase_date'),
      purchase_value: num(formData, 'purchase_value') ?? 0,
      current_value: newValue,
      currency: str(formData, 'currency'),
      country: str(formData, 'country'),
      notes: str(formData, 'notes'),
      valuation_history: valuationHistory,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/assets');
  revalidatePath('/dashboard');
  redirect('/more/assets');
}

export async function deleteAsset(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('assets').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/assets');
  revalidatePath('/dashboard');
  redirect('/more/assets');
}

// --- investments -----------------------------------------------------
export async function createInvestment(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('investments').insert({
    id: genId('inv'),
    household_id: household.id,
    type: str(formData, 'type'),
    name: str(formData, 'name'),
    provider: str(formData, 'provider'),
    owner_id: str(formData, 'owner_id'),
    currency: str(formData, 'currency') ?? household.base_currency,
    invested_amount: num(formData, 'invested_amount') ?? 0,
    current_value: num(formData, 'current_value') ?? 0,
    start_date: str(formData, 'start_date'),
    maturity_date: str(formData, 'maturity_date'),
    maturity_amount: num(formData, 'maturity_amount'),
    premium_amount: num(formData, 'premium_amount'),
    premium_frequency: str(formData, 'premium_frequency'),
    folio_number: str(formData, 'folio_number'),
    notes: str(formData, 'notes'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/investments');
  revalidatePath('/dashboard');
}

export async function updateInvestment(id: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase
    .from('investments')
    .update({
      type: str(formData, 'type'),
      name: str(formData, 'name'),
      provider: str(formData, 'provider'),
      owner_id: str(formData, 'owner_id'),
      currency: str(formData, 'currency'),
      invested_amount: num(formData, 'invested_amount') ?? 0,
      current_value: num(formData, 'current_value') ?? 0,
      start_date: str(formData, 'start_date'),
      maturity_date: str(formData, 'maturity_date'),
      maturity_amount: num(formData, 'maturity_amount'),
      premium_amount: num(formData, 'premium_amount'),
      premium_frequency: str(formData, 'premium_frequency'),
      folio_number: str(formData, 'folio_number'),
      notes: str(formData, 'notes'),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/investments');
  revalidatePath('/dashboard');
}

export async function deleteInvestment(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('investments').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/investments');
  revalidatePath('/dashboard');
}

// --- liabilities -----------------------------------------------------
export async function createLiability(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('liabilities').insert({
    id: genId('li'),
    household_id: household.id,
    name: str(formData, 'name'),
    type: str(formData, 'type'),
    original_amount: num(formData, 'original_amount') ?? 0,
    current_amount: num(formData, 'current_amount') ?? 0,
    currency: str(formData, 'currency') ?? household.base_currency,
    interest_rate: num(formData, 'interest_rate') ?? 0,
    monthly_payment: num(formData, 'monthly_payment') ?? 0,
    start_date: str(formData, 'start_date'),
    expected_end_date: str(formData, 'expected_end_date'),
    account_id: str(formData, 'account_id'),
    person_id: str(formData, 'person_id'),
    notes: str(formData, 'notes'),
    is_unconfirmed: bool(formData, 'is_unconfirmed'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/liabilities');
  revalidatePath('/dashboard');
  redirect('/more/liabilities');
}

export async function updateLiability(id: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase
    .from('liabilities')
    .update({
      name: str(formData, 'name'),
      type: str(formData, 'type'),
      original_amount: num(formData, 'original_amount') ?? 0,
      current_amount: num(formData, 'current_amount') ?? 0,
      currency: str(formData, 'currency'),
      interest_rate: num(formData, 'interest_rate') ?? 0,
      monthly_payment: num(formData, 'monthly_payment') ?? 0,
      start_date: str(formData, 'start_date'),
      expected_end_date: str(formData, 'expected_end_date'),
      account_id: str(formData, 'account_id'),
      person_id: str(formData, 'person_id'),
      notes: str(formData, 'notes'),
      is_unconfirmed: bool(formData, 'is_unconfirmed'),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/liabilities');
  revalidatePath('/dashboard');
  redirect('/more/liabilities');
}

export async function deleteLiability(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('liabilities').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/liabilities');
  revalidatePath('/dashboard');
  redirect('/more/liabilities');
}

// --- budgets -----------------------------------------------------------
export async function createBudget(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('budgets').insert({
    id: genId('b'),
    household_id: household.id,
    category_id: str(formData, 'category_id'),
    person_id: str(formData, 'person_id'),
    amount: num(formData, 'amount') ?? 0,
    currency: str(formData, 'currency') ?? household.base_currency,
    period: 'monthly',
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/budgets');
}

export async function deleteBudget(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/budgets');
}

// --- household settings -------------------------------------------------
export async function updateExchangeRates(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const rates: Record<string, number> = { ...household.exchange_rates };
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('rate_')) {
      const code = key.replace('rate_', '');
      const n = Number(value);
      if (!Number.isNaN(n)) rates[code] = n;
    }
  }
  const { error } = await supabase.from('households').update({ exchange_rates: rates }).eq('id', household.id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/currencies');
  revalidatePath('/dashboard');
}

export async function updateBaseCurrency(currency: string) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('households').update({ base_currency: currency }).eq('id', household.id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/currencies');
  revalidatePath('/dashboard');
}

// --- members -------------------------------------------------------------
export async function updateMember(id: string, formData: FormData) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase
    .from('members')
    .update({
      name: str(formData, 'name'),
      role: str(formData, 'role'),
      color: str(formData, 'color'),
      email: str(formData, 'email'),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/members');
}

export async function inviteMember(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('members').insert({
    id: genId('m'),
    household_id: household.id,
    name: str(formData, 'name'),
    role: str(formData, 'role'),
    color: str(formData, 'color') ?? 'teal',
    email: str(formData, 'email'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/members');
}

// --- shopping list (finance app quick list) ------------------------------
export async function addShoppingListItem(formData: FormData) {
  const { household } = await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('shopping_list').insert({
    id: genId('sl'),
    household_id: household.id,
    name: str(formData, 'name'),
    checked: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/more/shopping-list');
}

export async function toggleShoppingListItem(id: string, checked: boolean) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('shopping_list').update({ checked }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/shopping-list');
}

export async function deleteShoppingListItem(id: string) {
  await requireHousehold();
  const supabase = await db();
  const { error } = await supabase.from('shopping_list').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/more/shopping-list');
}
