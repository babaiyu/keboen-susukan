import { IonIcon } from '@ionic/react';
import { pencilOutline, trashOutline } from 'ionicons/icons';

import type { Harvest } from '../db/types';
import { formatDate, formatNumber } from '../lib/format';

interface HarvestListProps {
  harvests: Harvest[];
  onEdit: (harvest: Harvest) => void;
  onDelete: (harvest: Harvest) => void;
}

/** Harvest history for one plant, newest first (FR-3.3). */
const HarvestList: React.FC<HarvestListProps> = ({ harvests, onEdit, onDelete }) => {
  if (harvests.length === 0) {
    return (
      <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-6 text-center">
        <p className="text-sm text-base-content/60">
          Belum ada catatan panen. Tekan “Tambah panen” untuk mencatat hasil pertama.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {harvests.map((harvest) => (
        <article key={harvest.id} className="card card-border bg-base-100">
          <div className="card-body flex-row items-start gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {formatNumber(harvest.amount)} {harvest.unit}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60">
                <span>{formatDate(harvest.date)}</span>
                {harvest.grade ? <span>Kualitas {harvest.grade}</span> : null}
              </div>
              {harvest.notes ? <p className="mt-1.5 text-sm">{harvest.notes}</p> : null}
            </div>

            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onEdit(harvest)}
                aria-label={`Ubah panen ${formatDate(harvest.date)}`}
                className="btn btn-ghost btn-sm btn-square text-base-content/70"
              >
                <IonIcon icon={pencilOutline} className="text-lg" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(harvest)}
                aria-label={`Hapus panen ${formatDate(harvest.date)}`}
                className="btn btn-ghost btn-sm btn-square text-error"
              >
                <IonIcon icon={trashOutline} className="text-lg" aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default HarvestList;
