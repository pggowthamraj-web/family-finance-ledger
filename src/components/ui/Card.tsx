import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-teal-900/[0.06] bg-white p-4 shadow-card',
        className
      )}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-lg font-medium text-teal-900">{title}</h2>
      {action}
    </div>
  );
}
