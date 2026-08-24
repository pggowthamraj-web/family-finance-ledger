import { createClient } from './server';
import type {
  Account,
  Asset,
  Budget,
  Category,
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
