import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export function PageHeader({ title, backHref, action }: { title: string; backHref?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-1">
        {backHref && (
          <Link href={backHref} className="-ml-1.5 rounded-full p-1.5 text-teal-900/60 hover:bg-teal-900/[0.06]">
            <ChevronLeft size={20} />
          </Link>
        )}
        <h1 className="font-display text-2xl font-medium text-teal-900">{title}</h1>
      </div>
      {action}
    </div>
  );
}
