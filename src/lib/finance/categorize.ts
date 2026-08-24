import type { Category, Subcategory, Transaction } from './types';

/**
 * PROJECT_SPEC "Bank statement import & categorization": categorize by
 * keyword rules (grocery chains -> Groceries, fuel stations -> Transport /
 * Fuel, etc.) — using the `category_id` values already assigned in the
 * existing data as the canonical mapping for merchants seen so far.
 *
 * Two layers, tried in order:
 *  1. Exact merchant match against everything already categorized in this
 *     household's transaction history (the real canonical mapping).
 *  2. A small set of keyword rules for merchant types this household hasn't
 *     seen yet, resolved against whatever categories/subcategories actually
 *     exist (so it still works if categories get renamed or added to).
 */

function normalizeDescription(description: string): string {
  return description.trim().toLowerCase().replace(/\s+/g, ' ');
}

export interface MerchantCategoryMap {
  get(description: string): { categoryId: string | null; subcategoryId: string | null } | undefined;
}

/** Build the canonical merchant -> category mapping from existing history. */
export function buildMerchantCategoryMap(transactions: Transaction[]): MerchantCategoryMap {
  const counts = new Map<string, Map<string, { categoryId: string | null; subcategoryId: string | null; count: number }>>();

  for (const t of transactions) {
    if (t.type === 'transfer' || !t.description || !t.category_id) continue;
    const key = normalizeDescription(t.description);
    const bucket = counts.get(key) ?? new Map();
    const comboKey = `${t.category_id}::${t.subcategory_id ?? ''}`;
    const existing = bucket.get(comboKey);
    if (existing) existing.count++;
    else bucket.set(comboKey, { categoryId: t.category_id, subcategoryId: t.subcategory_id, count: 1 });
    counts.set(key, bucket);
  }

  const winner = new Map<string, { categoryId: string | null; subcategoryId: string | null }>();
  for (const [key, bucket] of counts) {
    let best: { categoryId: string | null; subcategoryId: string | null; count: number } | null = null;
    for (const candidate of bucket.values()) {
      if (!best || candidate.count > best.count) best = candidate;
    }
    if (best) winner.set(key, { categoryId: best.categoryId, subcategoryId: best.subcategoryId });
  }

  return {
    get: (description: string) => winner.get(normalizeDescription(description)),
  };
}

interface KeywordRule {
  keywords: RegExp;
  categoryName: string;
  subcategoryName?: string;
}

// Category/subcategory *names*, not ids — resolved against whatever this
// household actually has, so a rename doesn't break the rule.
const KEYWORD_RULES: KeywordRule[] = [
  { keywords: /tesco|sainsbury|asda|aldi|lidl|morrisons|waitrose|co-?op\b/i, categoryName: 'Groceries' },
  { keywords: /shell|bp\b|esso|texaco|petrol|fuel station/i, categoryName: 'Transport', subcategoryName: 'Fuel' },
  { keywords: /uber|bolt|taxi|tfl|trainline|national rail|bus pass/i, categoryName: 'Transport', subcategoryName: 'Public Transport' },
  { keywords: /mcdonald|kfc|deliveroo|just ?eat|uber ?eats|nando|costa|starbucks|pret\b|restaurant/i, categoryName: 'Eating Out' },
  { keywords: /netflix|spotify|disney\+|prime video|amazon prime|apple\.com\/bill/i, categoryName: 'Subscriptions' },
  { keywords: /british gas|edf|octopus energy|eon\b|scottish power/i, categoryName: 'Utilities', subcategoryName: 'Electricity' },
  { keywords: /thames water|severn trent|united utilities|anglian water/i, categoryName: 'Utilities', subcategoryName: 'Water' },
  { keywords: /virgin media|bt broadband|sky broadband|talktalk|plusnet/i, categoryName: 'Utilities', subcategoryName: 'Internet' },
  { keywords: /vodafone|ee\b|three\b|o2\b|giffgaff|lebara/i, categoryName: 'Utilities', subcategoryName: 'Mobile Phone' },
  { keywords: /boots|pharmacy|nhs|dentist|gp surgery|optician/i, categoryName: 'Healthcare' },
  { keywords: /school|tuition|nursery/i, categoryName: 'Education', subcategoryName: 'School' },
  { keywords: /h&m|zara|next\b|primark|asos/i, categoryName: 'Clothing' },
];

export function categorizeByKeywords(
  description: string,
  categories: Category[],
  subcategories: Subcategory[]
): { categoryId: string | null; subcategoryId: string | null } {
  for (const rule of KEYWORD_RULES) {
    if (!rule.keywords.test(description)) continue;
    const category = categories.find((c) => c.name.toLowerCase() === rule.categoryName.toLowerCase());
    if (!category) continue;
    const subcategory = rule.subcategoryName
      ? subcategories.find(
          (s) => s.category_id === category.id && s.name.toLowerCase() === rule.subcategoryName!.toLowerCase()
        )
      : undefined;
    return { categoryId: category.id, subcategoryId: subcategory?.id ?? null };
  }
  return { categoryId: null, subcategoryId: null };
}

/**
 * Best-effort category suggestion for a newly-imported transaction
 * description: try the household's own history first, then keyword rules.
 */
export function suggestCategory(
  description: string,
  merchantMap: MerchantCategoryMap,
  categories: Category[],
  subcategories: Subcategory[]
): { categoryId: string | null; subcategoryId: string | null; source: 'history' | 'keyword' | 'none' } {
  const fromHistory = merchantMap.get(description);
  if (fromHistory) return { ...fromHistory, source: 'history' };
  const fromKeywords = categorizeByKeywords(description, categories, subcategories);
  if (fromKeywords.categoryId) return { ...fromKeywords, source: 'keyword' };
  return { categoryId: null, subcategoryId: null, source: 'none' };
}
