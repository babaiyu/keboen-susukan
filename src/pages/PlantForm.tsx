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
import { createPlant, updatePlant } from '../db/plants';
import type { Plant } from '../db/types';
import { useBlobUrl } from '../hooks/useBlobUrl';
import { usePlant } from '../hooks/usePlants';
import { PLANT_CATEGORIES } from '../lib/constants';
import { parseDecimal } from '../lib/format';
import { compressImage } from '../lib/image';
import { useGardenStore } from '../store/useGardenStore';

interface PlantFormFieldsProps {
  plant: Plant | null;
  gardenId: number;
}

const PlantFormFields: React.FC<PlantFormFieldsProps> = ({ plant, gardenId }) => {
  const isEdit = plant != null;
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(plant?.name ?? '');
  const [category, setCategory] = useState(plant?.category ?? '');
  const [plantDate, setPlantDate] = useState(plant?.plantDate ?? '');
  const [quantity, setQuantity] = useState(plant?.quantity != null ? String(plant.quantity) : '');
  const [notes, setNotes] = useState(plant?.notes ?? '');
  const [photo, setPhoto] = useState<Blob | null>(plant?.photo ?? null);
  const [nameError, setNameError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [saving, setSaving] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const photoUrl = useBlobUrl(photo);

  const cancel = () => router.push(plant ? `/tabs/tanaman/detail?id=${plant.id}` : '/tabs/tanaman', 'back', 'pop');

  // Compress before storing so camera-sized photos stay light in IndexedDB
  // (PRD §9 / risk: photos filling storage).
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

    const trimmedName = name.trim();
    const parsedQuantity = quantity.trim() === '' ? undefined : parseDecimal(quantity);

    let valid = true;
    if (!trimmedName) {
      setNameError('Nama tanaman wajib diisi.');
      valid = false;
    } else {
      setNameError('');
    }
    if (parsedQuantity !== undefined && (!Number.isFinite(parsedQuantity) || parsedQuantity < 0)) {
      setQuantityError('Jumlah harus berupa angka 0 atau lebih.');
      valid = false;
    } else {
      setQuantityError('');
    }
    if (!valid) return;

    const details = {
      name: trimmedName,
      category: category || undefined,
      plantDate: plantDate || undefined,
      quantity: parsedQuantity,
      notes: notes.trim() || undefined,
      photo: photo ?? null,
    };

    setSaving(true);
    try {
      let target = '/tabs/tanaman';
      if (plant) {
        await updatePlant(plant.id, details);
        target = `/tabs/tanaman/detail?id=${plant.id}`;
      } else {
        const createdId = await createPlant({ gardenId, ...details });
        target = `/tabs/tanaman/detail?id=${createdId}`;
      }
      await presentToast({
        message: plant ? 'Perubahan tanaman disimpan.' : 'Tanaman berhasil ditambahkan.',
        duration: 1800,
        color: 'success',
        position: 'bottom',
      });
      router.push(target, 'forward', 'push');
    } catch {
      await presentToast({
        message: 'Gagal menyimpan tanaman. Coba lagi.',
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
          <div>
            <IonInput
              label="Nama tanaman"
              labelPlacement="stacked"
              placeholder="Contoh: Cabai Rawit"
              value={name}
              onIonInput={(event) => setName(event.detail.value ?? '')}
              required
            />
            {nameError ? <p className="mt-1 text-sm text-error">{nameError}</p> : null}
          </div>

          <IonSelect
            label="Kategori (opsional)"
            labelPlacement="stacked"
            placeholder="Pilih kategori"
            value={category || undefined}
            onIonChange={(event) => setCategory(String(event.detail.value))}
          >
            {PLANT_CATEGORIES.map((option) => (
              <IonSelectOption key={option} value={option}>
                {option}
              </IonSelectOption>
            ))}
          </IonSelect>

          <IonInput
            type="date"
            label="Tanggal tanam (opsional)"
            labelPlacement="stacked"
            value={plantDate}
            onIonInput={(event) => setPlantDate(event.detail.value ?? '')}
          />

          <div>
            <IonInput
              type="number"
              inputMode="numeric"
              min="0"
              label="Jumlah / populasi (opsional)"
              labelPlacement="stacked"
              placeholder="0"
              value={quantity}
              onIonInput={(event) => setQuantity(event.detail.value ?? '')}
            />
            {quantityError ? <p className="mt-1 text-sm text-error">{quantityError}</p> : null}
          </div>

          <IonTextarea
            label="Catatan (opsional)"
            labelPlacement="stacked"
            placeholder="Contoh: ditanam di bedeng 2"
            autoGrow
            value={notes}
            onIonInput={(event) => setNotes(event.detail.value ?? '')}
          />

          <div>
            <p className="mb-2 text-sm font-medium text-base-content/70">Foto (opsional)</p>
            {photoUrl ? (
              <div className="mb-3 overflow-hidden rounded-lg border border-base-300">
                <img src={photoUrl} alt="Pratinjau foto tanaman" className="h-40 w-full object-cover" />
              </div>
            ) : null}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              aria-label="Pilih foto tanaman"
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
        {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan tanaman'}
      </IonButton>
      <IonButton type="button" expand="block" fill="clear" color="medium" onClick={cancel}>
        Batal
      </IonButton>
    </form>
  );
};

const PlantForm: React.FC = () => {
  // Static route + query param: Ionic's tab outlet does not complete
  // transitions for parameterized routes (the page stays ion-page-invisible).
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const plantId = idParam ? Number(idParam) : undefined;
  const plant = usePlant(plantId);
  const activeGardenId = useGardenStore((state) => state.activeGardenId);

  const isEditLoading = plantId != null && plant === undefined;
  const notFound = plantId != null && plant === null;
  const gardenId = plant ? plant.gardenId : plantId == null ? activeGardenId : null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tanaman" text="Tanaman" />
          </IonButtons>
          <IonTitle>{plantId != null ? 'Ubah Tanaman' : 'Tanaman Baru'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {isEditLoading ? (
          <LoadingState />
        ) : notFound ? (
          <EmptyState
            icon={leafOutline}
            title="Tanaman tidak ditemukan"
            description="Tanaman ini mungkin sudah dihapus."
            action={<IonButton routerLink="/tabs/tanaman">Kembali ke katalog</IonButton>}
          />
        ) : gardenId == null ? (
          <EmptyState
            icon={leafOutline}
            title="Pilih kebun dulu"
            description="Tanaman selalu masuk ke satu kebun. Pilih kebun aktif di tab Tanaman atau buat kebun baru."
            action={<IonButton routerLink="/tabs/kebun">Buka tab Kebun</IonButton>}
          />
        ) : (
          <PlantFormFields key={plant?.id ?? 'new'} plant={plant ?? null} gardenId={gardenId} />
        )}
      </IonContent>
    </IonPage>
  );
};

export default PlantForm;
