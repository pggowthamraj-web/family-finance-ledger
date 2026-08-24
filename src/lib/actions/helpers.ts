import { createClient } from '@/lib/supabase/server';
import { getCurrentMember } from '@/lib/supabase/queries';

/** Every write action needs the caller's household id; RLS double-checks it server-side regardless. */
export async function requireHousehold() {
  const current = await getCurrentMember();
  if (!current) throw new Error('Not signed in');
  return current;
}

export async function db() {
  return createClient();
}

export function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

export function num(formData: FormData, key: string): number | null {
  const s = str(formData, key);
  if (s === null) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

export function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on' || formData.get(key) === 'true';
}
