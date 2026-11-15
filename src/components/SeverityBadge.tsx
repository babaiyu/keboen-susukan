import type { ProblemSeverity } from '../db/types';
import { PROBLEM_SEVERITIES, optionLabel } from '../lib/constants';

// Severity escalates from calm info to alert red, matching the DESIGN.md
// "Crop & Status Badges" guidance.
const SEVERITY_STYLES: Record<ProblemSeverity, string> = {
  ringan: 'badge-info',
  sedang: 'badge-warning',
  berat: 'badge-error',
};

interface SeverityBadgeProps {
  severity: ProblemSeverity;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => (
  <span className={`badge badge-soft badge-sm ${SEVERITY_STYLES[severity]}`}>
    {optionLabel(PROBLEM_SEVERITIES, severity)}
  </span>
);

export default SeverityBadge;
