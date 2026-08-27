import { createClient } from './server';
import type {
  Account,
  Asset,
  Budget,
  Category,
  FarmFertilizerApplication,
  FarmHarvest,
  Goal,
  Household,
  Investment,
  Liability,
  Member,
  RecurringTransaction,
  ShoppingCategory,
  ShoppingItem,
  ShoppingListItem,
  ShoppingTrip,
  Subcategory,
  Transaction,
} from '@/lib/finance/types';

/**
 * Resolves the signed-in Supabase Auth user to their `members` row (and the
 * household it belongs to). Returns null if there's no session or the user
 * hasn't been linked to a member yet (see supabase/migrations/0003_auth_link.sql).
 */
export async function getCurrentMember(): Promise<{ member: Member; household: Household } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase.from('members').select('*').eq('user_id', user.id).maybeSingle();
  if (!member) return null;

  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('id', member.household_id)
    .maybeSingle();
  if (!household) return null;

  return { member: member as Member, household: household as Household };
}

export interface HouseholdData {
  household: Household;
  member: Member;
  members: Member[];
  accounts: Account[];
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  assets: Asset[];
  investments: Investment[];
  liabilities: Liability[];
  goals: Goal[];
  budgets: Budget[];
  shoppingList: ShoppingListItem[];
}

/** One round-trip fetch of everything the main app screens need. */
export async function getHouseholdData(): Promise<HouseholdData | null> {
  const current = await getCurrentMember();
  if (!current) return null;
  const { member, household } = current;
  const supabase = await createClient();

  const [
    { data: members },
    { data: accounts },
    { data: categories },
    { data: subcategories },
    { data: transactions },
    { data: recurringTransactions },
    { data: assets },
    { data: investments },
    { data: liabilities },
    { data: goals },
    { data: budgets },
    { data: shoppingList },
  ] = await Promise.all([
    supabase.from('members').select('*').eq('household_id', household.id),
    supabase.from('accounts').select('*').eq('household_id', household.id).order('name'),
    supabase.from('categories').select('*').eq('household_id', household.id).order('sort_order'),
    supabase.from('subcategories').select('*'),
    supabase.from('transactions').select('*').eq('household_id', household.id).order('date', { ascending: false }),
    supabase.from('recurring_transactions').select('*').eq('household_id', household.id),
    supabase.from('assets').select('*').eq('household_id', household.id),
    supabase.from('investments').select('*').eq('household_id', household.id),
    supabase.from('liabilities').select('*').eq('household_id', household.id),
    supabase.from('goals').select('*').eq('household_id', household.id),
    supabase.from('budgets').select('*').eq('household_id', household.id),
    supabase.from('shopping_list').select('*').eq('household_id', household.id).order('added_at', { ascending: false }),
  ]);

  return {
    household,
    member,
    members: (members ?? []) as Member[],
    accounts: (accounts ?? []) as Account[],
    categories: (categories ?? []) as Category[],
    subcategories: (subcategories ?? []) as Subcategory[],
    transactions: (transactions ?? []) as Transaction[],
    recurringTransactions: (recurringTransactions ?? []) as RecurringTransaction[],
    assets: (assets ?? []) as Asset[],
    investments: (investments ?? []) as Investment[],
    liabilities: (liabilities ?? []) as Liability[],
    goals: (goals ?? []) as Goal[],
    budgets: (budgets ?? []) as Budget[],
    shoppingList: (shoppingList ?? []) as ShoppingListItem[],
  };
}

export interface TransactionsPageContext {
  household: Household;
  member: Member;
  members: Member[];
  categories: Category[];
  accounts: Account[];
}

/**
 * Lightweight context for the transactions list -- members/categories/
 * accounts only, deliberately NOT the full transactions table (see
 * getTransactionsPage below for how the list itself is fetched).
 */
export async function getTransactionsPageContext(): Promise<TransactionsPageContext | null> {
  const current = await getCurrentMember();
  if (!current) return null;
  const { member, household } = current;
  const supabase = await createClient();

  const [{ data: members }, { data: categories }, { data: accounts }] = await Promise.all([
    supabase.from('members').select('*').eq('household_id', household.id),
    supabase.from('categories').select('*').eq('household_id', household.id).order('sort_order'),
    supabase.from('accounts').select('*').eq('household_id', household.id).order('name'),
  ]);

  return {
    household,
    member,
    members: (members ?? []) as Member[],
    categories: (categories ?? []) as Category[],
    accounts: (accounts ?? []) as Account[],
  };
}

export interface TransactionFilters {
  search?: string;
  personId?: string;
  categoryId?: string;
  currency?: string;
  country?: string;
  from?: string;
  to?: string;
}

export interface TransactionsPageResult {
  transactions: Transaction[];
  total: number;
  hasMore: boolean;
}

export const TRANSACTIONS_PAGE_SIZE = 50;

/**
 * Real server-side pagination over the household's transactions, with
 * filters applied as actual WHERE clauses (not client-side array
 * filtering) so both filtering and paging stay correct at any table
 * size -- household transaction history is expected to keep growing as
 * more bank statements are imported, so this must never load the whole
 * table at once.
 */
export async function getTransactionsPage(
  filters: TransactionFilters,
  offset = 0,
  limit = TRANSACTIONS_PAGE_SIZE
): Promise<TransactionsPageResult | null> {
  const current = await getCurrentMember();
  if (!current) return null;
  const supabase = await createClient();

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('household_id', current.household.id)
    .order('date', { ascending: false })
    .order('id', { ascending: false });

  if (filters.search) query = query.ilike('description', `%${filters.search}%`);
  if (filters.personId) query = query.eq('person_id', filters.personId);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.currency) query = query.eq('currency', filters.currency);
  if (filters.country) query = query.eq('country', filters.country);
  if (filters.from) query = query.gte('date', filters.from);
  if (filters.to) query = query.lte('date', filters.to);

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    transactions: (data ?? []) as Transaction[],
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Distinct countries seen across the household's transactions, for the
 * country filter dropdown. Fetches only the `country` column (cheap even
 * at thousands of rows) rather than full rows, and is explicitly capped
 * -- this bounds a value-discovery query, not the transaction list itself.
 */
export async function getDistinctTransactionCountries(): Promise<string[]> {
  const current = await getCurrentMember();
  if (!current) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('transactions')
    .select('country')
    .eq('household_id', current.household.id)
    .not('country', 'is', null)
    .limit(5000);
  return [...new Set((data ?? []).map((r) => r.country as string).filter(Boolean))].sort();
}

export interface ShoppingData {
  categories: ShoppingCategory[];
  trips: ShoppingTrip[];
  items: ShoppingItem[];
}

export async function getShoppingData(): Promise<ShoppingData | null> {
  const current = await getCurrentMember();
  if (!current) return null;
  const supabase = await createClient();

  const [{ data: categories }, { data: trips }, { data: items }] = await Promise.all([
    supabase.from('shopping_categories').select('*').eq('household_id', current.household.id),
    supabase
      .from('shopping_trips')
      .select('*')
      .eq('household_id', current.household.id)
      .order('date', { ascending: false }),
    supabase.from('shopping_items').select('*'),
  ]);

  return {
    categories: (categories ?? []) as ShoppingCategory[],
    trips: (trips ?? []) as ShoppingTrip[],
    items: (items ?? []) as ShoppingItem[],
  };
}

export interface FarmData {
  household: Household;
  harvests: FarmHarvest[];
  fertilizerApplications: FarmFertilizerApplication[];
}

/** Yash Coconut Farm — a household side-venture, separate from the generic finance schema. */
export async function getFarmData(): Promise<FarmData | null> {
  const current = await getCurrentMember();
  if (!current) return null;
  const { household } = current;
  const supabase = await createClient();

  const [{ data: harvests }, { data: fertilizerApplications }] = await Promise.all([
    supabase.from('farm_harvests').select('*').eq('household_id', household.id).order('harvest_date', { ascending: false }),
    supabase
      .from('farm_fertilizer_applications')
      .select('*')
      .eq('household_id', household.id)
      .order('application_date', { ascending: false }),
  ]);

  return {
    household,
    harvests: (harvests ?? []) as FarmHarvest[],
    fertilizerApplications: (fertilizerApplications ?? []) as FarmFertilizerApplication[],
  };
}
