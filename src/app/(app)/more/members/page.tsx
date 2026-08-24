import { getHouseholdData } from '@/lib/supabase/queries';
import { updateMember, inviteMember } from '@/lib/actions/entities';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';

export default async function MembersPage() {
  const data = await getHouseholdData();
  if (!data) return null;

  return (
    <div>
      <PageHeader title="Family Members" backHref="/more" />
      <div className="space-y-3">
        {data.members.map((m) => (
          <Card key={m.id}>
            <form action={updateMember.bind(null, m.id)} className="space-y-2">
              <div className="flex gap-2">
                <input name="name" defaultValue={m.name} className={inputClass} placeholder="Name" />
                <input name="role" defaultValue={m.role ?? ''} className={inputClass} placeholder="Role" />
              </div>
              <input name="email" type="email" defaultValue={m.email ?? ''} className={inputClass} placeholder="Login email — must match their Supabase Auth account" />
              <div className="flex items-center gap-2">
                <select name="color" defaultValue={m.color ?? 'teal'} className={inputClass}>
                  <option value="teal">Teal</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                  <option value="emerald">Emerald</option>
                </select>
                <button type="submit" className="whitespace-nowrap rounded-xl bg-teal-900 px-4 py-2 text-sm font-medium text-white">
                  Save
                </button>
              </div>
              <p className="text-xs text-teal-900/40">{m.user_id ? 'Linked to a login' : 'Not linked to a login yet'}</p>
            </form>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <p className="mb-2 text-sm font-medium text-teal-900">Add a family member</p>
        <form action={inviteMember} className="space-y-2">
          <input name="name" required className={inputClass} placeholder="Name" />
          <input name="role" className={inputClass} placeholder="Role (e.g. Adult 1)" />
          <input name="email" type="email" className={inputClass} placeholder="Email (create their login in Supabase Auth separately)" />
          <button type="submit" className="w-full rounded-xl bg-teal-900 py-2.5 text-sm font-medium text-white">
            Add member
          </button>
        </form>
      </Card>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 text-sm text-teal-900 outline-none focus:border-teal-600';
