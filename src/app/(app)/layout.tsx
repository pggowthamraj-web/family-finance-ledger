import { getCurrentMember } from '@/lib/supabase/queries';
import { BottomNav } from '@/components/BottomNav';
import { Fab } from '@/components/Fab';
import { signOut } from '@/lib/actions/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentMember();

  if (!current) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-teal-900 px-6 text-center">
        <div className="max-w-sm rounded-3xl bg-white p-6 shadow-card">
          <h1 className="font-display text-xl font-medium text-teal-900">Almost there</h1>
          <p className="mt-2 text-sm text-teal-900/70">
            You're signed in, but this login isn't linked to a household member yet. Make sure a{' '}
            <code className="rounded bg-teal-900/[0.06] px-1">members</code> row exists with your email — the
            auth-link trigger connects it automatically the next time you sign in, or an existing member can add
            you from Settings → Family Members.
          </p>
          <form action={signOut} className="mt-4">
            <button className="text-sm font-medium text-teal-700 underline">Sign out</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg pb-24">
      <div className="px-4 pt-6">{children}</div>
      <BottomNav />
      <Fab />
    </div>
  );
}
