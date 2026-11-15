import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
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
import { useSearchParams } from 'react-router-dom';

import CategoryBadge from '../components/CategoryBadge';
import EmptyState from '../components/EmptyState';
import HarvestList from '../components/HarvestList';
import LoadingState from '../components/LoadingState';
import ProblemList from '../components/ProblemList';
import { deleteHarvest } from '../db/harvests';
import { deletePlant } from '../db/plants';
import { deleteProblem, updateProblem } from '../db/problems';
import type { Harvest, Plant, Problem } from '../db/types';
import { useBlobUrl } from '../hooks/useBlobUrl';
import { useHarvests, useTotalHarvest } from '../hooks/useHarvests';
import { usePlant } from '../hooks/usePlants';
import { useProblems } from '../hooks/useProblems';
import { formatDate, formatNumber } from '../lib/format';

interface PlantDetailBodyProps {
  plant: Plant;
  photoUrl?: string;
  totalHarvest: number;
  harvests: Harvest[];
  problems: Problem[];
  onDelete: (plant: Plant) => void;
  onAddHarvest: () => void;
  onEditHarvest: (harvest: Harvest) => void;
  onDeleteHarvest: (harvest: Harvest) => void;
  onAddProblem: () => void;
  onEditProblem: (problem: Problem) => void;
  onDeleteProblem: (problem: Problem) => void;
  onToggleProblemStatus: (problem: Problem) => void;
}

const PlantDetailBody: React.FC<PlantDetailBodyProps> = ({
  plant,
  photoUrl,
  totalHarvest,
  harvests,
  problems,
  onDelete,
  onAddHarvest,
  onEditHarvest,
  onDeleteHarvest,
  onAddProblem,
  onEditProblem,
  onDeleteProblem,
  onToggleProblemStatus,
}) => {
  const activeProblems = problems.filter((problem) => problem.status === 'aktif').length;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-4">
      <article className="card card-border bg-base-100">
        <div className="card-body gap-4 p-4">
          {photoUrl ? (
            <img src={photoUrl} alt={`Foto ${plant.name}`} className="h-48 w-full rounded-lg object-cover" />
          ) : null}

          <div>
            <h1 className="text-xl! font-bold!">{plant.name}</h1>
            <div className="mt-2">
              <CategoryBadge category={plant.category} />
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-base-content/60">Tanggal tanam</dt>
              <dd className="font-semibold">{formatDate(plant.plantDate)}</dd>
            </div>
            <div>
              <dt className="text-base-content/60">Jumlah</dt>
              <dd className="font-semibold">
                {plant.quantity != null ? `${formatNumber(plant.quantity)} tanaman` : 'Belum diisi'}
              </dd>
            </div>
          </dl>

          {plant.notes ? (
            <div>
              <p className="text-base-content/60">Catatan</p>
              <p className="mt-1">{plant.notes}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <IonButton
              expand="block"
              fill="outline"
              routerLink={`/tabs/tanaman/edit?id=${plant.id}`}
              routerDirection="forward"
            >
              Ubah data
            </IonButton>
            <IonButton expand="block" fill="outline" color="danger" onClick={() => onDelete(plant)}>
              Hapus tanaman
            </IonButton>
          </div>
        </div>
      </article>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base! font-semibold!">Panen</h2>
          <IonButton size="small" fill="outline" onClick={onAddHarvest}>
            <IonIcon icon={add} slot="start" />
            Tambah panen
          </IonButton>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
            <p className="text-sm text-base-content/60">Total panen</p>
            <p className="text-xl font-bold">{formatNumber(totalHarvest)} kg</p>
          </div>
          <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
            <p className="text-sm text-base-content/60">Catatan panen</p>
            <p className="text-xl font-bold">{formatNumber(harvests.length)}</p>
          </div>
        </div>

        <HarvestList harvests={harvests} onEdit={onEditHarvest} onDelete={onDeleteHarvest} />
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base! font-semibold!">Masalah tanaman</h2>
          <IonButton size="small" fill="outline" onClick={onAddProblem}>
            <IonIcon icon={add} slot="start" />
            Tambah masalah
          </IonButton>
        </div>

        {activeProblems > 0 ? (
          <p className="mb-2 text-sm text-base-content/60">{formatNumber(activeProblems)} masalah aktif</p>
        ) : null}

        <ProblemList
          problems={problems}
          onEdit={onEditProblem}
          onDelete={onDeleteProblem}
          onToggleStatus={onToggleProblemStatus}
        />
      </section>
    </div>
  );
};

const PlantDetail: React.FC = () => {
  // Static route + query param: Ionic's tab outlet does not complete
  // transitions for parameterized routes (the page stays ion-page-invisible).
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const plantId = idParam ? Number(idParam) : undefined;
  const plant = usePlant(plantId);
  const harvests = useHarvests(plantId);
  const totalHarvest = useTotalHarvest(plantId);
  const problems = useProblems(plantId);
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const photoUrl = useBlobUrl(plant?.photo ?? null);

  const goToList = () => {
    if (router.canGoBack()) router.goBack();
    else router.push('/tabs/tanaman', 'back', 'pop');
  };

  const removePlant = async (target: Plant) => {
    await deletePlant(target.id);
    await presentToast({
      message: 'Tanaman dihapus.',
      duration: 1600,
      color: 'danger',
      position: 'bottom',
    });
    goToList();
  };

  const confirmDeletePlant = (target: Plant) => {
    presentAlert({
      header: 'Hapus tanaman?',
      message: `“${target.name}” dan seluruh riwayat panen serta masalahnya akan dihapus. Tindakan ini tidak dapat dibatalkan.`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            void removePlant(target);
          },
        },
      ],
    });
  };

  const openNewHarvest = (plant: Plant) => router.push(`/tabs/tanaman/panen/new?plant=${plant.id}`, 'forward', 'push');

  const openEditHarvest = (harvest: Harvest) =>
    router.push(`/tabs/tanaman/panen/edit?id=${harvest.id}`, 'forward', 'push');

  const removeHarvest = async (harvest: Harvest) => {
    await deleteHarvest(harvest.id);
    await presentToast({
      message: 'Catatan panen dihapus.',
      duration: 1600,
      color: 'danger',
      position: 'bottom',
    });
  };

  const confirmDeleteHarvest = (harvest: Harvest) => {
    presentAlert({
      header: 'Hapus catatan panen?',
      message: `Panen ${formatNumber(harvest.amount)} ${harvest.unit} tanggal ${formatDate(harvest.date)} akan dihapus.`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            void removeHarvest(harvest);
          },
        },
      ],
    });
  };

  const openNewProblem = (plant: Plant) =>
    router.push(`/tabs/tanaman/masalah/new?plant=${plant.id}`, 'forward', 'push');

  const openEditProblem = (problem: Problem) =>
    router.push(`/tabs/tanaman/masalah/edit?id=${problem.id}`, 'forward', 'push');

  const removeProblem = async (problem: Problem) => {
    await deleteProblem(problem.id);
    await presentToast({
      message: 'Catatan masalah dihapus.',
      duration: 1600,
      color: 'danger',
      position: 'bottom',
    });
  };

  const confirmDeleteProblem = (problem: Problem) => {
    presentAlert({
      header: 'Hapus catatan masalah?',
      message: `Catatan “${problem.description}” akan dihapus.`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            void removeProblem(problem);
          },
        },
      ],
    });
  };

  const toggleProblemStatus = async (problem: Problem) => {
    const nextStatus = problem.status === 'aktif' ? 'teratasi' : 'aktif';
    await updateProblem(problem.id, { status: nextStatus });
    await presentToast({
      message: nextStatus === 'teratasi' ? 'Masalah ditandai teratasi.' : 'Masalah ditandai aktif.',
      duration: 1600,
      color: 'success',
      position: 'bottom',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tanaman" text="Tanaman" />
          </IonButtons>
          <IonTitle>Detail Tanaman</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {plant === undefined ? (
          <LoadingState />
        ) : plant === null ? (
          <EmptyState
            icon={leafOutline}
            title="Tanaman tidak ditemukan"
            description="Tanaman ini mungkin sudah dihapus."
            action={<IonButton routerLink="/tabs/tanaman">Kembali ke katalog</IonButton>}
          />
        ) : (
          <PlantDetailBody
            plant={plant}
            photoUrl={photoUrl}
            totalHarvest={totalHarvest}
            harvests={harvests ?? []}
            problems={problems ?? []}
            onDelete={confirmDeletePlant}
            onAddHarvest={() => openNewHarvest(plant)}
            onEditHarvest={openEditHarvest}
            onDeleteHarvest={confirmDeleteHarvest}
            onAddProblem={() => openNewProblem(plant)}
            onEditProblem={openEditProblem}
            onDeleteProblem={confirmDeleteProblem}
            onToggleProblemStatus={toggleProblemStatus}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default PlantDetail;
