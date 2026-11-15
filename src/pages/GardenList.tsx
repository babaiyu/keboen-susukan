import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonRouter,
  useIonToast,
} from '@ionic/react';
import { add, leafOutline } from 'ionicons/icons';
import { useState } from 'react';

import EmptyState from '../components/EmptyState';
import GardenCard from '../components/GardenCard';
import LoadingState from '../components/LoadingState';
import Onboarding from '../components/Onboarding';
import { deleteGarden } from '../db/gardens';
import { seedDemoData } from '../db/seed';
import type { Garden } from '../db/types';
import { useGardens } from '../hooks/useGardens';
import { hasSeenOnboarding, markOnboardingSeen } from '../lib/onboarding';
import { useGardenStore } from '../store/useGardenStore';

const GardenList: React.FC = () => {
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const gardens = useGardens();
  const activeGardenId = useGardenStore((state) => state.activeGardenId);
  const setActiveGarden = useGardenStore((state) => state.setActiveGarden);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());
  const [seeding, setSeeding] = useState(false);

  const removeGarden = async (garden: Garden) => {
    // Pick the next garden as active before the live list updates, so the
    // Tanaman tab never points at a deleted garden (FR-1.4).
    const remaining = (gardens ?? []).filter((item) => item.id !== garden.id);
    await deleteGarden(garden.id);
    if (activeGardenId === garden.id) {
      setActiveGarden(remaining[0]?.id ?? null);
    }
    await presentToast({
      message: 'Kebun dihapus.',
      duration: 1600,
      color: 'danger',
      position: 'bottom',
    });
  };

  const confirmDelete = (garden: Garden) => {
    presentAlert({
      header: 'Hapus kebun?',
      message: `“${garden.name}” dan seluruh tanaman, panen, serta masalah di dalamnya akan dihapus. Tindakan ini tidak dapat dibatalkan.`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            void removeGarden(garden);
          },
        },
      ],
    });
  };

  const openNew = () => router.push('/tabs/kebun/new', 'forward', 'push');

  const dismissOnboarding = () => {
    markOnboardingSeen();
    setShowOnboarding(false);
  };

  // Seeds a realistic demo garden so judges/testers can see the charts
  // immediately (PRD §14). Idempotent: repeated taps reuse the same garden.
  const loadDemo = async () => {
    setSeeding(true);
    try {
      const demoGardenId = await seedDemoData();
      setActiveGarden(demoGardenId);
      await presentToast({
        message: 'Data contoh dimuat.',
        duration: 1800,
        color: 'success',
        position: 'bottom',
      });
    } catch {
      await presentToast({
        message: 'Gagal memuat data contoh. Coba lagi.',
        duration: 2200,
        color: 'danger',
        position: 'bottom',
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Kebun Saya</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Kebun Saya</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-3">
          {gardens === undefined ? (
            <LoadingState />
          ) : gardens.length === 0 ? (
            <EmptyState
              icon={leafOutline}
              title="Belum ada kebun"
              description="Tambahkan kebun pertamamu untuk mulai mencatat tanaman, panen, dan masalah."
              action={
                <div className="flex w-full max-w-xs flex-col gap-2">
                  <IonButton onClick={openNew}>
                    <IonIcon icon={add} slot="start" />
                    Tambah kebun
                  </IonButton>
                  <IonButton fill="outline" disabled={seeding} onClick={loadDemo}>
                    {seeding ? 'Memuat…' : 'Muat data contoh'}
                  </IonButton>
                </div>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-base-content/60">
                {gardens.length} kebun tersimpan. Pilih satu untuk dibuka di tab Tanaman.
              </p>
              {gardens.map((garden) => (
                <GardenCard
                  key={garden.id}
                  garden={garden}
                  active={garden.id === activeGardenId}
                  onSelect={() => setActiveGarden(garden.id)}
                  onEdit={() => router.push(`/tabs/kebun/edit?id=${garden.id}`, 'forward', 'push')}
                  onDelete={() => confirmDelete(garden)}
                />
              ))}
            </div>
          )}
        </div>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={openNew} aria-label="Tambah kebun">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      <Onboarding open={showOnboarding && gardens?.length === 0} onDismiss={dismissOnboarding} />
    </IonPage>
  );
};

export default GardenList;
