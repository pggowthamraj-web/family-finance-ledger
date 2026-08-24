import { clsx } from 'clsx';

export function ProgressBar({
  percent,
  tone = 'teal',
  className,
}: {
  percent: number;
  tone?: 'teal' | 'amber' | 'rose' | 'emerald';
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const barColor = {
    teal: 'bg-teal-700',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
  }[tone];

  return (
    <div className={clsx('h-2 w-full overflow-hidden rounded-full bg-teal-900/[0.08]', className)}>
      <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${clamped}%` }} />
    </div>
  );
}
