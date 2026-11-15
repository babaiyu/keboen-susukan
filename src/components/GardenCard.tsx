import { IonIcon } from '@ionic/react';
import {
  calendarOutline,
  checkmarkCircle,
  locationOutline,
  pencilOutline,
  resizeOutline,
  trashOutline,
} from 'ionicons/icons';

import type { Garden } from '../db/types';
import { formatDate, formatNumber } from '../lib/format';

interface GardenCardProps {
  garden: Garden;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const GardenCard: React.FC<GardenCardProps> = ({ garden, active, onSelect, onEdit, onDelete }) => {
  const areaText = garden.area != null ? `${formatNumber(garden.area)} ${garden.areaUnit ?? ''}`.trim() : undefined;

  return (
    <article className={`card card-border bg-base-100 ${active ? 'border-primary ring-1 ring-primary/20' : ''}`}>
      <div className="card-body flex-row items-start gap-3 p-4">
        <button type="button" onClick={onSelect} aria-pressed={active} className="min-w-0 flex-1 text-left">
          <span className="flex items-center gap-2">
            <span className="truncate text-base font-semibold">{garden.name}</span>
            {active ? (
              <span className="badge badge-primary badge-sm shrink-0">
                <IonIcon icon={checkmarkCircle} className="mr-1" aria-hidden="true" />
                Aktif
              </span>
            ) : null}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60">
            {garden.location ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <IonIcon icon={locationOutline} aria-hidden="true" />
                <span className="truncate">{garden.location}</span>
              </span>
            ) : null}
            {areaText ? (
              <span className="inline-flex items-center gap-1">
                <IonIcon icon={resizeOutline} aria-hidden="true" />
                {areaText}
              </span>
            ) : null}
            {garden.startDate ? (
              <span className="inline-flex items-center gap-1">
                <IonIcon icon={calendarOutline} aria-hidden="true" />
                Mulai {formatDate(garden.startDate)}
              </span>
            ) : null}
          </span>
        </button>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Ubah ${garden.name}`}
            className="btn btn-ghost btn-sm btn-square text-base-content/70"
          >
            <IonIcon icon={pencilOutline} className="text-lg" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Hapus ${garden.name}`}
            className="btn btn-ghost btn-sm btn-square text-error"
          >
            <IonIcon icon={trashOutline} className="text-lg" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default GardenCard;
