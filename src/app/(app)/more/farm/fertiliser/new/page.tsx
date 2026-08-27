import { createFarmFertilizerApplication } from '@/lib/actions/farm';
import { FertilizerForm } from '@/components/FertilizerForm';
import { PageHeader } from '@/components/PageHeader';

export default function NewFertilizerApplicationPage() {
  return (
    <div>
      <PageHeader title="New fertiliser application" backHref="/more/farm/fertiliser" />
      <FertilizerForm action={createFarmFertilizerApplication} />
    </div>
  );
}
