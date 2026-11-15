import type { ProblemType } from '../db/types';
import { PROBLEM_TYPES, optionLabel } from '../lib/constants';

// Categorical pills for the five problem types. Colors are tuned for quick
// scanning in the field, following the badge conventions in docs/DESIGN.md.
const TYPE_STYLES: Record<ProblemType, string> = {
  hama: 'badge-warning',
  penyakit: 'badge-error',
  cuaca: 'badge-info',
  air: 'badge-info',
  nutrisi: 'badge-accent',
  lainnya: 'badge-neutral',
};

interface ProblemTypeBadgeProps {
  type: ProblemType;
}

const ProblemTypeBadge: React.FC<ProblemTypeBadgeProps> = ({ type }) => (
  <span className={`badge badge-soft badge-sm ${TYPE_STYLES[type]}`}>{optionLabel(PROBLEM_TYPES, type)}</span>
);

export default ProblemTypeBadge;
