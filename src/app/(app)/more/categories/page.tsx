import { getHouseholdData } from '@/lib/supabase/queries';
import { createCategory, deleteCategory, createSubcategory, deleteSubcategory } from '@/lib/actions/entities';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { X } from 'lucide-react';

export default async function CategoriesPage() {
  const data = await getHouseholdData();
  if (!data) return null;

  return (
    <div>
      <PageHeader title="Categories" backHref="/more" />

      <div className="space-y-3">
        {data.categories.map((c) => {
          const subs = data.subcategories.filter((s) => s.category_id === c.id);
          return (
            <Card key={c.id}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-teal-900">{c.name}</p>
                <form action={deleteCategory.bind(null, c.id)}>
                  <button className="text-teal-900/30">
                    <X size={16} />
                  </button>
                </form>
              </div>
              {subs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {subs.map((s) => (
                    <form key={s.id} action={deleteSubcategory.bind(null, s.id)}>
                      <button className="flex items-center gap-1 rounded-full bg-teal-900/[0.06] px-2 py-1 text-xs text-teal-900/70">
                        {s.name} <X size={10} />
                      </button>
                    </form>
                  ))}
                </div>
              )}
              <form action={createSubcategory.bind(null, c.id)} className="mt-2 flex gap-2">
                <input name="name" placeholder="Add subcategory" className="flex-1 rounded-lg border border-teal-900/10 bg-teal-50/50 px-2 py-1 text-xs" />
                <button type="submit" className="rounded-lg bg-teal-900/[0.06] px-2 py-1 text-xs font-medium text-teal-900">
                  Add
                </button>
              </form>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4">
        <p className="mb-2 text-sm font-medium text-teal-900">Add category</p>
        <form action={createCategory} className="flex gap-2">
          <input name="name" required placeholder="Category name" className="flex-1 rounded-xl border border-teal-900/10 bg-teal-50/50 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-xl bg-teal-900 px-4 py-2 text-sm font-medium text-white">
            Add
          </button>
        </form>
      </Card>
    </div>
  );
}
