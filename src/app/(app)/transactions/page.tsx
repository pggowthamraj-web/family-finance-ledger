import { getTransactionsPageContext, getTransactionsPage, getDistinctTransactionCountries } from '@/lib/supabase/queries';
import { CURRENCIES } from '@/lib/finance/currency';
import { TransactionsClient } from './TransactionsClient';

export default async function TransactionsPage() {
  const context = await getTransactionsPageContext();
  if (!context) return null;

  const [firstPage, countries] = await Promise.all([getTransactionsPage({}, 0), getDistinctTransactionCountries()]);
  if (!firstPage) return null;

  return (
    <TransactionsClient
      members={context.members}
      categories={context.categories}
      accounts={context.accounts}
      initialTransactions={firstPage.transactions}
      initialTotal={firstPage.total}
      initialHasMore={firstPage.hasMore}
      currencies={CURRENCIES.map((c) => c.code)}
      countries={countries}
    />
  );
}
