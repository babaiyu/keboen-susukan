import { IonSpinner } from '@ionic/react';

const LoadingState: React.FC = () => (
  <div className="flex justify-center py-16">
    <IonSpinner name="crescent" aria-label="Memuat data" />
  </div>
);

export default LoadingState;
