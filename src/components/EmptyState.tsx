import { IonIcon } from '@ionic/react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Shared friendly empty state used across the Kebun and Tanaman screens. */
const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
      <IonIcon icon={icon} className="text-3xl" aria-hidden="true" />
    </div>
    <h2 className="text-lg! font-bold! text-base-content">{title}</h2>
    {description ? <p className="mt-2 max-w-xs text-sm text-base-content/60">{description}</p> : null}
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

export default EmptyState;
