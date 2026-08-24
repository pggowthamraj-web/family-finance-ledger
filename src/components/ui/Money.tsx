import { clsx } from 'clsx';
import { currencySymbol } from '@/lib/finance/currency';

/** Monetary figures always render in IBM Plex Mono per the design language. */
export function Money({
  amount,
  currency,
  className,
  signed = false,
  compact = false,
}: {
  amount: number;
  currency: string;
  className?: string;
  signed?: boolean;
  compact?: boolean;
}) {
  const symbol = currencySymbol(currency);
  const abs = Math.abs(amount);
  const formatted = compact
    ? formatCompact(abs)
    : abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = signed ? (amount < 0 ? '-' : amount > 0 ? '+' : '') : amount < 0 ? '-' : '';

  return (
    <span className={clsx('font-mono tabular-nums', className)}>
      {sign}
      {symbol}
      {formatted}
    </span>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(0);
}
