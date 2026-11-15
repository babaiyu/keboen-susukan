import { IonIcon } from '@ionic/react';
import { pencilOutline, trashOutline } from 'ionicons/icons';

import type { Problem } from '../db/types';
import { useBlobUrl } from '../hooks/useBlobUrl';
import { formatDate } from '../lib/format';

import ProblemTypeBadge from './ProblemTypeBadge';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';

interface ProblemRowProps {
  problem: Problem;
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
  onToggleStatus: (problem: Problem) => void;
}

const ProblemRow: React.FC<ProblemRowProps> = ({ problem, onEdit, onDelete, onToggleStatus }) => {
  const photoUrl = useBlobUrl(problem.photo ?? null);

  return (
    <article className="card card-border bg-base-100">
      <div className="card-body gap-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <ProblemTypeBadge type={problem.type} />
          <SeverityBadge severity={problem.severity} />
          <StatusBadge status={problem.status} />
          <span className="ml-auto text-sm text-base-content/60">{formatDate(problem.date)}</span>
        </div>

        <p className="font-medium">{problem.description}</p>
        {problem.action ? <p className="text-sm text-base-content/60">Tindakan: {problem.action}</p> : null}
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`Foto masalah: ${problem.description}`}
            className="h-36 w-full rounded-lg object-cover"
          />
        ) : null}

        <div className="mt-1 flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onToggleStatus(problem)}>
            {problem.status === 'aktif' ? 'Tandai teratasi' : 'Tandai aktif'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(problem)}
            aria-label={`Ubah masalah ${formatDate(problem.date)}`}
          >
            <IonIcon icon={pencilOutline} className="text-base" aria-hidden="true" />
            Ubah
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-error"
            onClick={() => onDelete(problem)}
            aria-label={`Hapus masalah ${formatDate(problem.date)}`}
          >
            <IonIcon icon={trashOutline} className="text-base" aria-hidden="true" />
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
};

interface ProblemListProps {
  problems: Problem[];
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
  onToggleStatus: (problem: Problem) => void;
}

/** Problem history for one plant, newest first, with status toggling (FR-4.4/4.5). */
const ProblemList: React.FC<ProblemListProps> = ({ problems, onEdit, onDelete, onToggleStatus }) => {
  if (problems.length === 0) {
    return (
      <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-6 text-center">
        <p className="text-sm text-base-content/60">
          Belum ada catatan masalah. Tekan “Tambah masalah” kalau ada hama, penyakit, atau kendala lain.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {problems.map((problem) => (
        <ProblemRow
          key={problem.id}
          problem={problem}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default ProblemList;
