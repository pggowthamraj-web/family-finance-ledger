import { signInWithPassword } from '@/lib/actions/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-teal-900 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-medium text-white">Family Finance</h1>
          <p className="mt-2 text-sm text-teal-200">Shared household ledger for Gowtham &amp; Sanjana</p>
        </div>

        <form action={signInWithPassword} className="rounded-3xl bg-white p-6 shadow-card">
          <input type="hidden" name="next" value={next ?? '/dashboard'} />

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
          )}

          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-medium text-teal-900/70">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2.5 text-teal-900 outline-none focus:border-teal-600"
              placeholder="you@family.com"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1 block text-xs font-medium text-teal-900/70">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2.5 text-teal-900 outline-none focus:border-teal-600"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-teal-900 px-4 py-3 font-medium text-white transition hover:bg-teal-800 active:scale-[0.99]"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-teal-300">
          Accounts are created by an admin in the Supabase dashboard — there's no public sign-up.
        </p>
      </div>
    </main>
  );
}
