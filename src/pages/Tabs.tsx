import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { barChartOutline, flowerOutline, leafOutline } from 'ionicons/icons';
import { Navigate, Route } from 'react-router-dom';

import GardenForm from './GardenForm';
import GardenList from './GardenList';
import Grafik from './Grafik';
import HarvestForm from './HarvestForm';
import PlantDetail from './PlantDetail';
import PlantForm from './PlantForm';
import PlantList from './PlantList';
import ProblemForm from './ProblemForm';

/**
 * Tab shell. Routes are relative to the parent `/tabs/*` route so that each
 * tab keeps its own navigation stack (Ionic React Router v6 requirement).
 */
const Tabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="kebun" element={<GardenList />} />
      <Route path="kebun/new" element={<GardenForm />} />
      <Route path="kebun/edit" element={<GardenForm />} />
      <Route path="tanaman" element={<PlantList />} />
      <Route path="tanaman/new" element={<PlantForm />} />
      <Route path="tanaman/edit" element={<PlantForm />} />
      <Route path="tanaman/detail" element={<PlantDetail />} />
      <Route path="tanaman/panen/new" element={<HarvestForm />} />
      <Route path="tanaman/panen/edit" element={<HarvestForm />} />
      <Route path="tanaman/masalah/new" element={<ProblemForm />} />
      <Route path="tanaman/masalah/edit" element={<ProblemForm />} />
      <Route path="grafik" element={<Grafik />} />
      <Route index element={<Navigate to="kebun" replace />} />
      <Route path="*" element={<Navigate to="kebun" replace />} />
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="kebun" href="/tabs/kebun">
        <IonIcon icon={leafOutline} />
        <IonLabel>Kebun</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tanaman" href="/tabs/tanaman">
        <IonIcon icon={flowerOutline} />
        <IonLabel>Tanaman</IonLabel>
      </IonTabButton>
      <IonTabButton tab="grafik" href="/tabs/grafik">
        <IonIcon icon={barChartOutline} />
        <IonLabel>Grafik</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default Tabs;
