import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from '@ionic/react';
import { cameraOutline, leafOutline, trashOutline } from 'ionicons/icons';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { addProblem, updateProblem } from '../db/problems';
import type { Problem, ProblemSeverity, ProblemType } from '../db/types';
import { useBlobUrl } from '../hooks/useBlobUrl';
import { usePlant } from '../hooks/usePlants';
import { useProblem } from '../hooks/useProblems';
import { PROBLEM_SEVERITIES, PROBLEM_TYPES } from '../lib/constants';
import { todayISO } from '../lib/format';
import { compressImage } from '../lib/image';

interface ProblemFormFieldsProps {
  problem: Problem | null;
  plantId: number;
  plantName: string;
}

const ProblemFormFields: React.FC<ProblemFormFieldsProps> = ({ problem, plantId, plantName }) => {
  const isEdit = problem != null;
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Date defaults to today, but the user can pick the actual event date (FR-4.1).
  const [date, setDate] = useState(problem?.date ?? todayISO());
  const [type, setType] = useState<ProblemType | ''>(problem?.type ?? '');
  const [severity, setSeverity] = useState<ProblemSeverity>(problem?.severity ?? 'ringan');
  const [description, setDescription] = useState(problem?.description ?? '');
  const [action, setAction] = useState(problem?.action ?? '');
  const [photo, setPhoto] = useState<Blob | null>(problem?.photo ?? null);
  const [dateError, setDateError] = useState('');
  const [typeError, setTypeError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const photoUrl = useBlobUrl(photo);

  const goBack = () => router.push(`/tabs/tanaman/detail?id=${plantId}`, 'back', 'pop');

  // Compress before storing so camera-sized photos stay light (PRD §9).
  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProcessingPhoto(true);
    try {
      setPhoto(await compressImage(file));
    } finally {
      setProcessingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDescription = description.trim();

    let valid = true;
    if (!date) {
      setDateError('Tanggal masalah wajib diisi.');
      valid = false;
    } else {
      setDateError('');
    }
    if (!type) {
      setTypeError('Jenis masalah wajib dipilih.');
      valid = false;
    } else {
      setTypeError('');
    }
    if (!trimmedDescription) {
      setDescriptionError('Deskripsi masalah wajib diisi.');
      valid = false;
    } else {
      setDescriptionError('');
    }
    if (!valid || !type) return;

    const details = {
      date,
      type,
      severity,
      description: trimmedDescription,
      action: action.trim() || undefined,
      photo: photo ?? null,
    };

    setSaving(true);
    try {
      if (problem) {
        await updateProblem(problem.id, details);
      } else {
        // New problems start as active; the user can resolve them later (FR-4.3).
        await addProblem({ plantId, ...details, status: 'aktif' });
      }
      await presentToast({
        message: problem ? 'Perubahan masalah disimpan.' : 'Masalah berhasil dicatat.',
        duration: 1800,
        color: 'success',
        position: 'bottom',
      });
      goBack();
    } catch {
      await presentToast({
        message: 'Gagal menyimpan masalah. Coba lagi.',
        duration: 2200,
        color: 'danger',
        position: 'bottom',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-4">
      <div className="card card-border bg-base-100">
        <div className="card-body gap-4 p-4">
          <p className="text-sm text-base-content/60">
            Tanaman: <span className="font-semibold text-base-content">{plantName}</span>
          </p>

          <div>
            <IonInput
              type="date"
              label="Tanggal masalah"
              labelPlacement="stacked"
              value={date}
              onIonInput={(event) => setDate(event.detail.value ?? '')}
              required
            />
            {dateError ? <p className="mt-1 text-sm text-error">{dateError}</p> : null}
          </div>

          <div>
            <IonSelect
              label="Jenis masalah"
              labelPlacement="stacked"
              placeholder="Pilih jenis"
              value={type || undefined}
              onIonChange={(event) => setType(event.detail.value as ProblemType)}
            >
              {PROBLEM_TYPES.map((option) => (
                <IonSelectOption key={option.value} value={option.value}>
                  {option.label}
                </IonSelectOption>
              ))}
            </IonSelect>
            {typeError ? <p className="mt-1 text-sm text-error">{typeError}</p> : null}
          </div>

          <IonSelect
            label="Tingkat keparahan"
            labelPlacement="stacked"
            value={severity}
            onIonChange={(event) => setSeverity(event.detail.value as ProblemSeverity)}
          >
            {PROBLEM_SEVERITIES.map((option) => (
              <IonSelectOption key={option.value} value={option.value}>
                {option.label}
              </IonSelectOption>
            ))}
          </IonSelect>

          <div>
            <IonTextarea
              label="Deskripsi masalah"
              labelPlacement="stacked"
              placeholder="Contoh: daun menguning dan ada bercak"
              autoGrow
              value={description}
              onIonInput={(event) => setDescription(event.detail.value ?? '')}
              required
            />
            {descriptionError ? <p className="mt-1 text-sm text-error">{descriptionError}</p> : null}
          </div>

          <IonTextarea
            label="Tindakan yang dilakukan (opsional)"
            labelPlacement="stacked"
            placeholder="Contoh: disemprot pestisida organik"
            autoGrow
            value={action}
            onIonInput={(event) => setAction(event.detail.value ?? '')}
          />

          <div>
            <p className="mb-2 text-sm font-medium text-base-content/70">Foto (opsional)</p>
            {photoUrl ? (
              <div className="mb-3 overflow-hidden rounded-lg border border-base-300">
                <img src={photoUrl} alt="Pratinjau foto masalah" className="h-40 w-full object-cover" />
              </div>
            ) : null}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              aria-label="Pilih foto masalah"
            />
            <div className="flex flex-wrap items-center gap-2">
              <IonButton
                type="button"
                fill="outline"
                disabled={processingPhoto}
                onClick={() => photoInputRef.current?.click()}
              >
                <IonIcon icon={cameraOutline} slot="start" />
                {processingPhoto ? 'Memproses…' : photo ? 'Ganti foto' : 'Pilih foto'}
              </IonButton>
              {photo ? (
                <IonButton type="button" size="small" fill="clear" color="danger" onClick={removePhoto}>
                  <IonIcon icon={trashOutline} slot="start" />
                  Hapus foto
                </IonButton>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <IonButton type="submit" expand="block" disabled={saving}>
        {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan masalah'}
      </IonButton>
      <IonButton type="button" expand="block" fill="clear" color="medium" onClick={goBack}>
        Batal
      </IonButton>
    </form>
  );
};

const ProblemForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const problemId = idParam ? Number(idParam) : undefined;
  const plantParam = searchParams.get('plant');

  const problem = useProblem(problemId);
  const plantId = problemId != null ? problem?.plantId : plantParam ? Number(plantParam) : undefined;
  const plant = usePlant(plantId);

  const isEdit = problemId != null;
  const problemLoading = isEdit && problem === undefined;
  const plantLoading = plantId != null && plant === undefined;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tanaman" text="Tanaman" />
          </IonButtons>
          <IonTitle>{isEdit ? 'Ubah Masalah' : 'Masalah Baru'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {problemLoading || plantLoading ? (
          <LoadingState />
        ) : plant != null && plantId != null && (!isEdit || problem != null) ? (
          <ProblemFormFields problem={problem ?? null} plantId={plantId} plantName={plant.name} />
        ) : (
          <EmptyState
            icon={leafOutline}
            title="Masalah tidak ditemukan"
            description="Catatan masalah atau tanaman ini mungkin sudah dihapus."
            action={<IonButton routerLink="/tabs/tanaman">Kembali ke katalog</IonButton>}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProblemForm;
