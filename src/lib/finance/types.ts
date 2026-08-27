// Row shapes mirror the Postgres columns 1:1 (snake_case) so query results
// can be used directly without a mapping layer.

export type CurrencyCode = 'GBP' | 'INR' | 'USD' | 'EUR' | string;

export interface Household {
  id: string;
  name: string;
  base_currency: CurrencyCode;
  exchange_rates: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  household_id: string;
  user_id: string | null;
  email: string | null;
  name: string;
  role: string | null;
  color: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  household_id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
}

export type AccountType =
  | 'Bank Account'
  | 'Cash'
  | 'Credit Card'
  | 'Savings Account'
  | 'Investment Account'
  | 'Digital Wallet';

export interface Account {
  id: string;
  household_id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: number;
  owner_id: string | null;
  country: string | null;
  notes: string | null;
  is_derived_placeholder: boolean;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  categoryId?: string | null;
}

export interface Transaction {
  id: string;
  household_id: string;
  type: TransactionType;
  date: string; // yyyy-mm-dd
  amount: number;
  currency: CurrencyCode;
  category_id: string | null;
  subcategory_id: string | null;
  description: string | null;
  person_id: string | null;
  entered_by_id: string | null;
  account_id: string;
  to_account_id: string | null;
  recurring: boolean;
  notes: string | null;
  country: string | null;
  items: ReceiptItem[] | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type RecurringFrequency =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'half-yearly'
  | 'yearly'
  | 'custom';

export interface RecurringTransaction {
  id: string;
  household_id: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  category_id: string | null;
  subcategory_id: string | null;
  frequency: RecurringFrequency;
  account_id: string | null;
  person_id: string | null;
  active: boolean;
  type: 'expense' | 'income';
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface ValuationPoint {
  date: string;
  value: number;
}

export interface Asset {
  id: string;
  household_id: string;
  name: string;
  type: string;
  owner_id: string | null;
  purchase_date: string | null;
  purchase_value: number;
  current_value: number;
  currency: CurrencyCode;
  country: string | null;
  notes: string | null;
  valuation_history: ValuationPoint[];
  created_at: string;
  updated_at: string;
}

export type InvestmentType =
  | 'LIC Insurance'
  | 'Mutual Fund'
  | 'PPF'
  | 'Stocks'
  | 'Fixed Deposit'
  | 'Other';

export interface Investment {
  id: string;
  household_id: string;
  type: InvestmentType;
  name: string;
  provider: string | null;
  owner_id: string | null;
  currency: CurrencyCode;
  invested_amount: number;
  current_value: number;
  start_date: string | null;
  maturity_date: string | null;
  maturity_amount: number | null;
  premium_amount: number | null;
  premium_frequency: RecurringFrequency | null;
  folio_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type LiabilityType =
  | 'Mortgage'
  | 'Car Loan'
  | 'Personal Loan'
  | 'Credit Card'
  | 'Education Loan'
  | 'Other';

export interface Liability {
  id: string;
  household_id: string;
  name: string;
  type: LiabilityType;
  original_amount: number;
  current_amount: number;
  currency: CurrencyCode;
  interest_rate: number;
  monthly_payment: number;
  start_date: string | null;
  expected_end_date: string | null;
  account_id: string | null;
  person_id: string | null;
  notes: string | null;
  is_unconfirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  date: string;
  amount: number;
}

export interface Goal {
  id: string;
  household_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  currency: CurrencyCode;
  target_date: string | null;
  current_amount: number;
  monthly_contribution: number;
  account_id: string | null;
  priority: 'Low' | 'Medium' | 'High' | null;
  owner_id: string | null; // member id, or 'shared'
  notes: string | null;
  contributions: GoalContribution[];
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  household_id: string;
  category_id: string | null;
  person_id: string | null;
  amount: number;
  currency: CurrencyCode;
  period: 'monthly';
  created_at: string;
}

export interface ShoppingListItem {
  id: string;
  household_id: string;
  name: string;
  checked: boolean;
  added_at: string;
}

export interface ShoppingCategory {
  id: string;
  household_id: string;
  name: string;
}

export interface ShoppingTrip {
  id: string;
  household_id: string;
  store: string;
  date: string;
  currency: CurrencyCode;
  notes: string | null;
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  trip_id: string;
  name: string;
  quantity: number;
  price: number;
  category_id: string | null;
}

// Yash Coconut Farm — see supabase/migrations/0004_coconut_farm.sql

export interface FarmHarvest {
  id: string;
  household_id: string;
  harvest_date: string;
  trees_harvested: number;
  small_coconuts_count: number;
  small_coconut_price: number; // per coconut
  big_coconuts_count: number;
  big_coconut_price: number; // per coconut
  watchman_salary: number;
  labour_charges: number;
  currency: CurrencyCode;
  performed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmFertilizerApplication {
  id: string;
  household_id: string;
  application_date: string;
  trees_count: number;
  fertilizer_cost_per_tree: number;
  labour_cost_per_tree: number;
  currency: CurrencyCode;
  performed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
