'use client';

import Link from 'next/link';

export default function FarmError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-display text-lg font-medium text-teal-900">Something went wrong</p>
      <p className="max-w-sm text-sm text-teal-900/60">{error.message || 'An unexpected error occurred.'}</p>
      <div className="flex gap-2">
        <button onClick={() => reset()} className="rounded-xl bg-teal-900 px-4 py-2 text-sm font-medium text-white">
          Try again
        </button>
        <Link href="/more/farm" className="rounded-xl border border-teal-900/10 px-4 py-2 text-sm font-medium text-teal-900">
          Back to farm
        </Link>
      </div>
    </div>
  );
}
