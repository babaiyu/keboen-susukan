// Soft, categorical pills. Colors map to the DESIGN.md crop/status palette:
// leaf green for leafy crops, amber for fruiting crops, and so on.

const CATEGORY_STYLES: Record<string, string> = {
  'Sayuran daun': 'badge-success',
  'Sayuran buah': 'badge-warning',
  'Sayuran umbi': 'badge-accent',
  'Rempah & herba': 'badge-info',
  'Buah-buahan': 'badge-secondary',
};

interface CategoryBadgeProps {
  category?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  if (!category) return null;

  return (
    <span className={`badge badge-soft badge-sm ${CATEGORY_STYLES[category] ?? 'badge-neutral'}`}>{category}</span>
  );
};

export default CategoryBadge;
