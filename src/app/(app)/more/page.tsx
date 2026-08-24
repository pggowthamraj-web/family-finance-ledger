import Link from 'next/link';
import {
  Users,
  Tags,
  Repeat,
  Building2,
  CreditCard,
  PiggyBank,
  Coins,
  ScanLine,
  ShoppingBasket,
  ListChecks,
  Download,
  Moon,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { signOut } from '@/lib/actions/auth';
import { getCurrentMember } from '@/lib/supabase/queries';

const ITEMS = [
  { href: '/more/members', label: 'Family Members', icon: Users },
  { href: '/more/categories', label: 'Categories', icon: Tags },
  { href: '/more/recurring', label: 'Recurring Transactions', icon: Repeat },
  { href: '/more/assets', label: 'Assets', icon: Building2 },
  { href: '/more/liabilities', label: 'Liabilities', icon: CreditCard },
  { href: '/more/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/more/currencies', label: 'Currencies & Exchange Rates', icon: Coins },
  { href: '/more/receipts', label: 'Scan Receipts', icon: ScanLine },
  { href: '/shopping', label: 'Shopping / Grocery Tracker', icon: ShoppingBasket },
  { href: '/more/shopping-list', label: 'Shopping List', icon: ListChecks },
  { href: '/more/export', label: 'Data Export', icon: Download },
  { href: '/more/theme', label: 'Theme', icon: Moon },
];

export default async function MorePage() {
  const current = await getCurrentMember();

  return (
    <div>
      <PageHeader title="More" />
      {current && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: colorFor(current.member.color) }}
          >
            {current.member.name.slice(0, 1)}
          </div>
          <div>
            <p className="text-sm font-medium text-teal-900">{current.member.name}</p>
            <p className="text-xs text-teal-900/50">{current.member.role}</p>
          </div>
        </div>
      )}

      <div className="divide-y divide-teal-900/[0.06] overflow-hidden rounded-2xl bg-white shadow-card">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center justify-between px-4 py-3.5">
            <span className="flex items-center gap-3 text-sm text-teal-900">
              <Icon size={18} className="text-teal-700" />
              {label}
            </span>
            <ChevronRight size={16} className="text-teal-900/30" />
          </Link>
        ))}
      </div>

      <form action={signOut} className="mt-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-900/10 py-3 text-sm font-medium text-teal-900/70">
          <LogOut size={16} /> Sign out
        </button>
      </form>
    </div>
  );
}

function colorFor(color: string | null): string {
  const map: Record<string, string> = { teal: '#0f3d3d', amber: '#f5a623', rose: '#e94560', emerald: '#0f9d70' };
  return map[color ?? ''] ?? '#0f3d3d';
}
