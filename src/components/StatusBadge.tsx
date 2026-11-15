import type { ProblemStatus } from '../db/types';
import { PROBLEM_STATUSES, optionLabel } from '../lib/constants';

// Active problems stay visible as a warning; resolved ones read as healthy.
const STATUS_STYLES: Record<ProblemStatus, string> = {
  aktif: 'badge-warning',
  teratasi: 'badge-success',
};

interface StatusBadgeProps {
  status: ProblemStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`badge badge-soft badge-sm ${STATUS_STYLES[status]}`}>{optionLabel(PROBLEM_STATUSES, status)}</span>
);

export default StatusBadge;
