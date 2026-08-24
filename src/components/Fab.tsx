'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Target, Building2, CreditCard } from 'lucide-react';

const ACTIONS = [
  { href: '/transactions/new?type=expense', label: 'Expense', icon: ArrowUpRight, tone: 'text-rose-500' },
  { href: '/transactions/new?type=income', label: 'Income', icon: ArrowDownLeft, tone: 'text-emerald-500' },
  { href: '/accounts/transfer', label: 'Transfer', icon: ArrowLeftRight, tone: 'text-teal-700' },
  { href: '/goals/contribute', label: 'Goal Contribution', icon: Target, tone: 'text-amber-500' },
  { href: '/more/assets/new', label: 'Asset', icon: Building2, tone: 'text-teal-700' },
  { href: '/more/liabilities/new', label: 'Liability', icon: CreditCard, tone: 'text-teal-700' },
];

export function Fab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <button
          aria-label="Close quick actions"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-teal-900/30 backdrop-blur-[2px]"
        />
      )}

      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
        {open &&
          ACTIONS.map(({ href, label, icon: Icon, tone }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-full bg-white py-2 pl-3 pr-4 text-sm font-medium text-teal-900 shadow-card"
            >
              <Icon size={18} className={tone} />
              {label}
            </Link>
          ))}

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close quick actions' : 'Quick actions'}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition active:scale-95"
        >
          {open ? <X size={26} /> : <Plus size={26} />}
        </button>
      </div>
    </>
  );
}
