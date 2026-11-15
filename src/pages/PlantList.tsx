import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { add, leafOutline, searchOutline } from 'ionicons/icons';
import { useState } from 'react';

import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PlantCard from '../components/PlantCard';
import { useGardens } from '../hooks/useGardens';
import { usePlants } from '../hooks/usePlants';
import { useGardenStore } from '../store/useGardenStore';

const PlantList: React.FC = () => {
  const router = useIonRouter();
  const gardens = useGardens();
  const storedGardenId = useGardenStore((state) => state.activeGardenId);
  const setActiveGarden = useGardenStore((state) => state.setActiveGarden);
  const [search, setSearch] = useState('');
  // Ignore a persisted id that no longer matches a garden (e.g. IndexedDB was
  // cleared while localStorage survived) so we show "pilih kebun" instead of a
  // misleading empty catalog.
  const activeGardenId = gardens?.some((garden) => garden.id === storedGardenId) ? storedGardenId : null;
  const plants = usePlants(activeGardenId, search);

  const openNew = () => router.push('/tabs/tanaman/new', 'forward', 'push');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tanaman</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tanaman</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-3">
          {gardens === undefined ? (
            <LoadingState />
          ) : gardens.length === 0 ? (
            <EmptyState
              icon={leafOutline}
              title="Belum ada kebun"
              description="Buat kebun dulu supaya kamu bisa menambahkan tanaman ke dalamnya."
              action={
                <IonButton routerLink="/tabs/kebun" routerDirection="root">
                  Buka tab Kebun
                </IonButton>
              }
            />
          ) : (
            <>
              <div className="card card-border mb-3 bg-base-100">
                <div className="card-body p-3">
                  <IonSelect
                    label="Kebun aktif"
                    labelPlacement="stacked"
                    placeholder="Pilih kebun"
                    value={activeGardenId ?? undefined}
                    onIonChange={(event) => {
                      const nextId = Number(event.detail.value);
                      if (Number.isFinite(nextId)) setActiveGarden(nextId);
                    }}
                  >
                    {gardens.map((garden) => (
                      <IonSelectOption key={garden.id} value={garden.id}>
                        {garden.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>
              </div>

              {activeGardenId == null ? (
                <EmptyState
                  icon={leafOutline}
                  title="Pilih kebun dulu"
                  description="Pilih salah satu kebun di atas untuk melihat katalog tanamannya."
                />
              ) : (
                <>
                  <IonSearchbar
                    value={search}
                    onIonInput={(event) => setSearch(event.detail.value ?? '')}
                    placeholder="Cari nama tanaman"
                    debounce={200}
                  />

                  {plants === undefined ? (
                    <LoadingState />
                  ) : plants.length === 0 ? (
                    <EmptyState
                      icon={search ? searchOutline : leafOutline}
                      title={search ? 'Tanaman tidak ditemukan' : 'Belum ada tanaman'}
                      description={
                        search
                          ? `Tidak ada tanaman yang cocok dengan “${search}”.`
                          : 'Tambahkan tanaman pertama di kebun ini untuk mulai mencatat panen dan masalah.'
                      }
                      action={
                        search ? undefined : (
                          <IonButton onClick={openNew}>
                            <IonIcon icon={add} slot="start" />
                            Tambah tanaman
                          </IonButton>
                        )
                      }
                    />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {plants.map((plant) => (
                        <PlantCard
                          key={plant.id}
                          plant={plant}
                          onOpen={() => router.push(`/tabs/tanaman/detail?id=${plant.id}`, 'forward', 'push')}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {activeGardenId != null ? (
          <IonFab slot="fixed" vertical="bottom" horizontal="end">
            <IonFabButton onClick={openNew} aria-label="Tambah tanaman">
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default PlantList;
