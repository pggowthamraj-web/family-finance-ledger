import { clsx } from 'clsx';

const TONES = {
  neutral: 'bg-teal-900/[0.06] text-teal-900',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-600',
  emerald: 'bg-emerald-100 text-emerald-600',
} as const;

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
