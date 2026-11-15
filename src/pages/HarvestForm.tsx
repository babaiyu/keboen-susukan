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
  IonTextarea,
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
import { addHarvest, updateHarvest } from '../db/harvests';
import type { Harvest } from '../db/types';
import { useHarvest } from '../hooks/useHarvests';
import { usePlant } from '../hooks/usePlants';
import { HARVEST_UNITS } from '../lib/constants';
import { parseDecimal, todayISO } from '../lib/format';

interface HarvestFormFieldsProps {
  harvest: Harvest | null;
  plantId: number;
  plantName: string;
}

const HarvestFormFields: React.FC<HarvestFormFieldsProps> = ({ harvest, plantId, plantName }) => {
  const isEdit = harvest != null;
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  // Date defaults to today so the common case is a single tap to save (FR-3.2).
  const [date, setDate] = useState(harvest?.date ?? todayISO());
  const [amount, setAmount] = useState(harvest ? String(harvest.amount) : '');
  const [unit, setUnit] = useState<string>(harvest?.unit ?? HARVEST_UNITS[0]);
  const [grade, setGrade] = useState(harvest?.grade ?? '');
  const [notes, setNotes] = useState(harvest?.notes ?? '');
  const [dateError, setDateError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [saving, setSaving] = useState(false);

  const goBack = () => router.push(`/tabs/tanaman/detail?id=${plantId}`, 'back', 'pop');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = parseDecimal(amount);

    let valid = true;
    if (!date) {
      setDateError('Tanggal panen wajib diisi.');
      valid = false;
    } else {
      setDateError('');
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Jumlah panen harus berupa angka lebih dari 0.');
      valid = false;
    } else {
      setAmountError('');
    }
    if (!valid) return;

    const details = {
      date,
      amount: parsedAmount,
      unit,
      grade: grade.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    setSaving(true);
    try {
      if (harvest) {
        await updateHarvest(harvest.id, details);
      } else {
        await addHarvest({ plantId, ...details });
      }
      await presentToast({
        message: harvest ? 'Perubahan panen disimpan.' : 'Panen berhasil dicatat.',
        duration: 1800,
        color: 'success',
        position: 'bottom',
      });
      goBack();
    } catch {
      await presentToast({
        message: 'Gagal menyimpan panen. Coba lagi.',
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
              label="Tanggal panen"
              labelPlacement="stacked"
              value={date}
              onIonInput={(event) => setDate(event.detail.value ?? '')}
              required
            />
            {dateError ? <p className="mt-1 text-sm text-error">{dateError}</p> : null}
          </div>

          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <IonInput
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                label="Jumlah"
                labelPlacement="stacked"
                placeholder="0"
                value={amount}
                onIonInput={(event) => setAmount(event.detail.value ?? '')}
                required
              />
            </div>
            <div className="w-28 shrink-0">
              <IonSelect
                label="Satuan"
                labelPlacement="stacked"
                value={unit}
                onIonChange={(event) => setUnit(String(event.detail.value))}
              >
                {HARVEST_UNITS.map((option) => (
                  <IonSelectOption key={option} value={option}>
                    {option}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>
          {amountError ? <p className="text-sm text-error">{amountError}</p> : null}

          <IonInput
            label="Kualitas / grade (opsional)"
            labelPlacement="stacked"
            placeholder="Contoh: A"
            value={grade}
            onIonInput={(event) => setGrade(event.detail.value ?? '')}
          />

          <IonTextarea
            label="Catatan (opsional)"
            labelPlacement="stacked"
            placeholder="Contoh: panen pagi, hasil bagus"
            autoGrow
            value={notes}
            onIonInput={(event) => setNotes(event.detail.value ?? '')}
          />
        </div>
      </div>

      <IonButton type="submit" expand="block" disabled={saving}>
        {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan panen'}
      </IonButton>
      <IonButton type="button" expand="block" fill="clear" color="medium" onClick={goBack}>
        Batal
      </IonButton>
    </form>
  );
};

const HarvestForm: React.FC = () => {
  // Static route + query params, matching the other forms: Ionic's tab outlet
  // does not complete transitions for parameterized routes.
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const harvestId = idParam ? Number(idParam) : undefined;
  const plantParam = searchParams.get('plant');

  const harvest = useHarvest(harvestId);
  const plantId = harvestId != null ? harvest?.plantId : plantParam ? Number(plantParam) : undefined;
  const plant = usePlant(plantId);

  const isEdit = harvestId != null;
  const harvestLoading = isEdit && harvest === undefined;
  const plantLoading = plantId != null && plant === undefined;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tanaman" text="Tanaman" />
          </IonButtons>
          <IonTitle>{isEdit ? 'Ubah Panen' : 'Panen Baru'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {harvestLoading || plantLoading ? (
          <LoadingState />
        ) : plant != null && plantId != null && (!isEdit || harvest != null) ? (
          <HarvestFormFields harvest={harvest ?? null} plantId={plantId} plantName={plant.name} />
        ) : (
          <EmptyState
            icon={leafOutline}
            title="Panen tidak ditemukan"
            description="Catatan panen atau tanaman ini mungkin sudah dihapus."
            action={<IonButton routerLink="/tabs/tanaman">Kembali ke katalog</IonButton>}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default HarvestForm;
