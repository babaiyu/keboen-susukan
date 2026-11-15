import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from '@ionic/react';
import { leafOutline } from 'ionicons/icons';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { createGarden, updateGarden } from '../db/gardens';
import type { Garden, GardenInput } from '../db/types';
import { useGarden } from '../hooks/useGardens';
import { AREA_UNITS } from '../lib/constants';
import { parseDecimal } from '../lib/format';
import { useGardenStore } from '../store/useGardenStore';

interface GardenFormFieldsProps {
  garden: Garden | null;
}

const GardenFormFields: React.FC<GardenFormFieldsProps> = ({ garden }) => {
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const setActiveGarden = useGardenStore((state) => state.setActiveGarden);

  const isEdit = garden != null;
  const [name, setName] = useState(garden?.name ?? '');
  const [location, setLocation] = useState(garden?.location ?? '');
  const [area, setArea] = useState(garden?.area != null ? String(garden.area) : '');
  const [areaUnit, setAreaUnit] = useState<string>(garden?.areaUnit ?? AREA_UNITS[0]);
  const [startDate, setStartDate] = useState(garden?.startDate ?? '');
  const [nameError, setNameError] = useState('');
  const [areaError, setAreaError] = useState('');
  const [saving, setSaving] = useState(false);

  const goToList = () => router.push('/tabs/kebun', 'back', 'pop');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedArea = area.trim() === '' ? undefined : parseDecimal(area);

    let valid = true;
    if (!trimmedName) {
      setNameError('Nama kebun wajib diisi.');
      valid = false;
    } else {
      setNameError('');
    }
    if (parsedArea !== undefined && (!Number.isFinite(parsedArea) || parsedArea < 0)) {
      setAreaError('Luas harus berupa angka 0 atau lebih.');
      valid = false;
    } else {
      setAreaError('');
    }
    if (!valid) return;

    const input: GardenInput = {
      name: trimmedName,
      location: location.trim() ? location.trim() : undefined,
      area: parsedArea,
      areaUnit: parsedArea !== undefined ? areaUnit : undefined,
      startDate: startDate || undefined,
    };

    setSaving(true);
    try {
      if (garden) {
        await updateGarden(garden.id, input);
      } else {
        const createdId = await createGarden(input);
        // Open the new garden straight away in the Tanaman tab.
        setActiveGarden(createdId);
      }
      await presentToast({
        message: garden ? 'Perubahan kebun disimpan.' : 'Kebun berhasil dibuat.',
        duration: 1800,
        color: 'success',
        position: 'bottom',
      });
      goToList();
    } catch {
      await presentToast({
        message: 'Gagal menyimpan kebun. Coba lagi.',
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
              label="Nama kebun"
              labelPlacement="stacked"
              placeholder="Contoh: Kebun Belakang Rumah"
              value={name}
              onIonInput={(event) => setName(event.detail.value ?? '')}
              required
            />
            {nameError ? <p className="mt-1 text-sm text-error">{nameError}</p> : null}
          </div>

          <IonInput
            label="Lokasi / keterangan (opsional)"
            labelPlacement="stacked"
            placeholder="Contoh: RT 02, dekat sungai"
            value={location}
            onIonInput={(event) => setLocation(event.detail.value ?? '')}
          />

          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <IonInput
                type="number"
                inputMode="decimal"
                min="0"
                label="Luas (opsional)"
                labelPlacement="stacked"
                placeholder="0"
                value={area}
                onIonInput={(event) => setArea(event.detail.value ?? '')}
              />
            </div>
            <div className="w-32 shrink-0">
              <IonSelect
                label="Satuan"
                labelPlacement="stacked"
                value={areaUnit}
                onIonChange={(event) => setAreaUnit(String(event.detail.value))}
              >
                {AREA_UNITS.map((unit) => (
                  <IonSelectOption key={unit} value={unit}>
                    {unit}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>
          {areaError ? <p className="text-sm text-error">{areaError}</p> : null}

          <div>
            <IonInput
              type="date"
              label="Tanggal mulai (opsional)"
              labelPlacement="stacked"
              value={startDate}
              onIonInput={(event) => setStartDate(event.detail.value ?? '')}
            />
            {startDate ? (
              <IonButton type="button" size="small" fill="clear" color="medium" onClick={() => setStartDate('')}>
                Hapus tanggal
              </IonButton>
            ) : null}
          </div>
        </div>
      </div>

      <IonButton type="submit" expand="block" disabled={saving}>
        {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan kebun'}
      </IonButton>
      <IonButton type="button" expand="block" fill="clear" color="medium" onClick={goToList}>
        Batal
      </IonButton>
    </form>
  );
};

const GardenForm: React.FC = () => {
  // Static route + query param: Ionic's tab outlet does not complete
  // transitions for parameterized routes (the page stays ion-page-invisible).
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const gardenId = idParam ? Number(idParam) : undefined;
  const garden = useGarden(gardenId);

  const isEditLoading = gardenId != null && garden === undefined;
  const notFound = gardenId != null && garden === null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/kebun" text="Kebun" />
          </IonButtons>
          <IonTitle>{gardenId != null ? 'Ubah Kebun' : 'Kebun Baru'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {isEditLoading ? (
          <LoadingState />
        ) : notFound ? (
          <EmptyState
            icon={leafOutline}
            title="Kebun tidak ditemukan"
            description="Kebun ini mungkin sudah dihapus."
            action={<IonButton routerLink="/tabs/kebun">Kembali ke daftar kebun</IonButton>}
          />
        ) : (
          <GardenFormFields key={garden?.id ?? 'new'} garden={garden ?? null} />
        )}
      </IonContent>
    </IonPage>
  );
};

export default GardenForm;
