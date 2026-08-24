import { getHouseholdData } from '@/lib/supabase/queries';
import { updateExchangeRates, updateBaseCurrency } from '@/lib/actions/entities';
import { CURRENCIES } from '@/lib/finance/currency';
import { PageHeader } from '@/components/PageHeader';
import { Card, SectionHeader } from '@/components/ui/Card';

export default async function CurrenciesPage() {
  const data = await getHouseholdData();
  if (!data) return null;
  const { household } = data;
  const rates = household.exchange_rates;
  const allCodes = [...new Set([...CURRENCIES.map((c) => c.code), ...Object.keys(rates)])];

  return (
    <div>
      <PageHeader title="Currencies & Exchange Rates" backHref="/more" />

      <Card className="mb-4">
        <SectionHeader title="Base currency" />
        <form
          action={async (formData: FormData) => {
            'use server';
            await updateBaseCurrency(String(formData.get('base_currency')));
          }}
          className="flex gap-2"
        >
          <select name="base_currency" defaultValue={household.base_currency} className={inputClass}>
            {allCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-xl bg-teal-900 px-4 py-2 text-sm font-medium text-white">
            Save
          </button>
        </form>
      </Card>

      <Card>
        <SectionHeader title="Exchange rates (against base)" />
        <p className="mb-3 text-xs text-teal-900/50">
          No live FX feed — rates are manually entered here. Past transactions keep their original recorded amount
          and currency; only display/aggregation totals use the current rate.
        </p>
        <form action={updateExchangeRates} className="space-y-2">
          {allCodes.map((code) => (
            <div key={code} className="flex items-center gap-2">
              <span className="w-14 text-sm font-medium text-teal-900">{code}</span>
              <input
                type="number"
                step="0.0001"
                name={`rate_${code}`}
                defaultValue={rates[code] ?? (code === household.base_currency ? 1 : '')}
                disabled={code === household.base_currency}
                className={`${inputClass} disabled:opacity-50`}
              />
            </div>
          ))}
          <button type="submit" className="w-full rounded-xl bg-teal-900 py-2.5 text-sm font-medium text-white">
            Save rates
          </button>
        </form>
      </Card>
    </div>
  );
}

const inputClass = 'flex-1 rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 text-sm text-teal-900';
