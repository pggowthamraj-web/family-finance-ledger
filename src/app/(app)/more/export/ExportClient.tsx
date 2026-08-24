'use client';

import type { HouseholdData, ShoppingData } from '@/lib/supabase/queries';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Download } from 'lucide-react';

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv<T extends object>(rows: T[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]) as (keyof T)[];
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

export function ExportClient({ household, shopping }: { household: HouseholdData; shopping: ShoppingData }) {
  const everything = { ...household, shopping };

  return (
    <div>
      <PageHeader title="Data Export" backHref="/more" />

      <Card className="mb-3">
        <p className="mb-3 text-sm text-teal-900/70">Export everything as one JSON file — a full backup of your household&apos;s data.</p>
        <button
          onClick={() => download('family-finance-export.json', JSON.stringify(everything, null, 2), 'application/json')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-900 py-3 text-sm font-medium text-white"
        >
          <Download size={16} /> Download JSON
        </button>
      </Card>

      <Card>
        <p className="mb-3 text-sm text-teal-900/70">Export transactions as a spreadsheet-friendly CSV.</p>
        <button
          onClick={() => download('transactions.csv', toCsv(household.transactions), 'text/csv')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-900/20 py-3 text-sm font-medium text-teal-900"
        >
          <Download size={16} /> Download transactions.csv
        </button>
      </Card>
    </div>
  );
}
