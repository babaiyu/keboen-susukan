import { IonIcon } from '@ionic/react';
import { chevronForwardOutline, leafOutline } from 'ionicons/icons';

import type { Plant } from '../db/types';
import { useBlobUrl } from '../hooks/useBlobUrl';
import { formatDate, formatNumber } from '../lib/format';

import CategoryBadge from './CategoryBadge';

interface PlantCardProps {
  plant: Plant;
  onOpen: () => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onOpen }) => {
  const photoUrl = useBlobUrl(plant.photo ?? null);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="card card-border w-full bg-base-100 text-left transition-colors hover:border-primary/40"
    >
      <span className="card-body flex-row items-center gap-3 p-3">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IonIcon icon={leafOutline} className="text-2xl" aria-hidden="true" />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{plant.name}</span>
          <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-base-content/60">
            <CategoryBadge category={plant.category} />
            {plant.quantity != null ? <span>{formatNumber(plant.quantity)} tanaman</span> : null}
            {plant.plantDate ? <span>Tanam {formatDate(plant.plantDate)}</span> : null}
          </span>
        </span>

        <IonIcon icon={chevronForwardOutline} className="shrink-0 text-base-content/30" aria-hidden="true" />
      </span>
    </button>
  );
};

export default PlantCard;
