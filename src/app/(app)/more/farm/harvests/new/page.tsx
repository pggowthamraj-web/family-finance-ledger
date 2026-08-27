import { createFarmHarvest } from '@/lib/actions/farm';
import { HarvestForm } from '@/components/HarvestForm';
import { PageHeader } from '@/components/PageHeader';

export default function NewHarvestPage() {
  return (
    <div>
      <PageHeader title="New harvest" backHref="/more/farm/harvests" />
      <HarvestForm action={createFarmHarvest} />
    </div>
  );
}
