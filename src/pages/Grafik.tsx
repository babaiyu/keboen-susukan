import {
  IonButton,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { barChartOutline, leafOutline } from 'ionicons/icons';
import { Suspense, lazy, useMemo, useState } from 'react';

import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { seedDemoData } from '../db/seed';
import type { Harvest, Plant, Problem } from '../db/types';
import { useGarden, useGardens } from '../hooks/useGardens';
import { useHarvestsByGarden } from '../hooks/useHarvests';
import { usePlants } from '../hooks/usePlants';
import { useProblemsByGarden } from '../hooks/useProblems';
import {
  PROBLEM_BREAKDOWNS,
  TIME_RANGES,
  buildHarvestSeries,
  buildProblemSeries,
  summarize,
  timeRangeLabel,
  type ProblemBreakdown,
  type TimeRange,
} from '../lib/analytics';
import { HARVEST_UNITS } from '../lib/constants';
import { formatNumber } from '../lib/format';
import { useGardenStore } from '../store/useGardenStore';

// Recharts is intentionally heavy, so the chart components live in their own
// chunk and load on demand. The page shell stays eager: wrapping the route
// element in Suspense would interrupt Ionic's page transition (the page would
// remain transparent).
const HarvestTrendChart = lazy(() => import('../components/charts/HarvestTrendChart'));
const ProblemTrendChart = lazy(() => import('../components/charts/ProblemTrendChart'));

// Stable empty references keep the derived-data memos from recomputing while
// the live queries are still undefined.
const EMPTY_PLANTS: readonly Plant[] = [];
const EMPTY_HARVESTS: readonly Harvest[] = [];
const EMPTY_PROBLEMS: readonly Problem[] = [];

const ChartPlaceholder: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-base-300 bg-base-200/40 px-6 text-center">
    <p className="text-sm text-base-content/60">{message}</p>
  </div>
);

const Grafik: React.FC = () => {
  const gardens = useGardens();
  const storedGardenId = useGardenStore((state) => state.activeGardenId);
  const setActiveGarden = useGardenStore((state) => state.setActiveGarden);
  const [presentToast] = useIonToast();

  // Ignore a persisted id that no longer matches a garden (e.g. IndexedDB was
  // cleared while localStorage survived).
  const activeGardenId = gardens?.some((garden) => garden.id === storedGardenId) ? storedGardenId : null;

  const garden = useGarden(activeGardenId);
  const plants = usePlants(activeGardenId);
  const harvests = useHarvestsByGarden(activeGardenId);
  const problems = useProblemsByGarden(activeGardenId);

  const [range, setRange] = useState<TimeRange>('30d');
  const [breakdown, setBreakdown] = useState<ProblemBreakdown>('severity');
  const [plantFilter, setPlantFilter] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);

  const plantList = plants ?? EMPTY_PLANTS;
  const harvestList = harvests ?? EMPTY_HARVESTS;
  const problemList = problems ?? EMPTY_PROBLEMS;

  // A plant filter only applies while that plant still belongs to the garden.
  // Deriving it (instead of resetting via an effect) keeps the state valid when
  // the user switches gardens.
  const activePlantFilter =
    plantFilter != null && plantList.some((plant) => plant.id === plantFilter) ? plantFilter : null;

  const harvestData = useMemo(
    () => buildHarvestSeries(harvestList, range, activePlantFilter),
    [harvestList, range, activePlantFilter],
  );
  const problemData = useMemo(
    () => buildProblemSeries(problemList, range, breakdown, activePlantFilter),
    [problemList, range, breakdown, activePlantFilter],
  );
  const summary = useMemo(
    () => summarize(harvestList, plantList, problemList, range, activePlantFilter),
    [harvestList, plantList, problemList, range, activePlantFilter],
  );

  const hasHarvestData = harvestData.some((point) => point.value > 0);
  const hasProblemData = problemData.series.length > 0;
  const unit = HARVEST_UNITS[0] ?? 'kg';

  const detailLoading =
    activeGardenId != null && (plants === undefined || harvests === undefined || problems === undefined);

  // Same demo seeder as the Kebun tab, so a brand-new install can jump straight
  // to a populated Grafik for a demo (PRD §14).
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
          <IonTitle>Grafik</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Grafik</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-3">
          {gardens === undefined ? (
            <LoadingState />
          ) : gardens.length === 0 ? (
            <EmptyState
              icon={leafOutline}
              title="Belum ada kebun"
              description="Buat kebun dulu supaya grafik panen dan masalah bisa ditampilkan."
              action={
                <div className="flex w-full max-w-xs flex-col gap-2">
                  <IonButton routerLink="/tabs/kebun" routerDirection="root">
                    Buka tab Kebun
                  </IonButton>
                  <IonButton fill="outline" disabled={seeding} onClick={loadDemo}>
                    {seeding ? 'Memuat…' : 'Muat data contoh'}
                  </IonButton>
                </div>
              }
            />
          ) : (
            <>
              <div className="card card-border mb-3 bg-base-100">
                <div className="card-body p-3">
                  <IonSelect
                    label="Kebun"
                    labelPlacement="stacked"
                    placeholder="Pilih kebun"
                    value={activeGardenId ?? undefined}
                    onIonChange={(event) => {
                      const nextId = Number(event.detail.value);
                      if (Number.isFinite(nextId)) setActiveGarden(nextId);
                    }}
                  >
                    {gardens.map((item) => (
                      <IonSelectOption key={item.id} value={item.id}>
                        {item.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>
              </div>

              {activeGardenId == null ? (
                <EmptyState
                  icon={barChartOutline}
                  title="Pilih kebun dulu"
                  description="Pilih salah satu kebun di atas untuk melihat grafik perkembangannya."
                />
              ) : detailLoading ? (
                <LoadingState />
              ) : plantList.length === 0 ? (
                <EmptyState
                  icon={leafOutline}
                  title="Belum ada tanaman"
                  description={`Tambahkan tanaman di ${garden?.name ?? 'kebun ini'} untuk mulai melihat grafik.`}
                  action={<IonButton routerLink="/tabs/tanaman">Buka tab Tanaman</IonButton>}
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 rounded-box border border-base-300 bg-base-100 px-4 py-3">
                      <p className="text-sm text-base-content/60">
                        {range === 'all' ? 'Total panen keseluruhan' : `Total panen ${timeRangeLabel(range)} terakhir`}
                      </p>
                      <p className="mt-1 text-3xl font-bold text-primary">
                        {formatNumber(summary.totalHarvest)} {unit}
                      </p>
                    </div>
                    <div className="rounded-box border border-base-300 bg-base-100 px-4 py-3">
                      <p className="text-sm text-base-content/60">Tanaman</p>
                      <p className="mt-1 text-2xl font-bold">{formatNumber(summary.plantCount)}</p>
                      <p className="text-xs text-base-content/60">
                        {activePlantFilter == null ? 'di kebun ini' : 'sedang difilter'}
                      </p>
                    </div>
                    <div className="rounded-box border border-base-300 bg-base-100 px-4 py-3">
                      <p className="text-sm text-base-content/60">Masalah aktif</p>
                      <p
                        className={`mt-1 text-2xl font-bold ${
                          summary.activeProblemCount > 0 ? 'text-warning' : 'text-base-content'
                        }`}
                      >
                        {formatNumber(summary.activeProblemCount)}
                      </p>
                      <p className="text-xs text-base-content/60">belum teratasi</p>
                    </div>
                  </div>

                  <div className="card card-border mt-4 bg-base-100">
                    <div className="card-body gap-3 p-3">
                      <IonSelect
                        label="Tanaman"
                        labelPlacement="stacked"
                        value={activePlantFilter ?? 'all'}
                        onIonChange={(event) => {
                          const next = event.detail.value;
                          setPlantFilter(next == null || next === 'all' ? null : Number(next));
                        }}
                      >
                        <IonSelectOption value="all">Semua tanaman</IonSelectOption>
                        {plantList.map((plant) => (
                          <IonSelectOption key={plant.id} value={plant.id}>
                            {plant.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>

                      <div>
                        <p className="mb-2 text-sm font-medium text-base-content/70">Rentang waktu</p>
                        <IonSegment
                          value={range}
                          onIonChange={(event) => {
                            const next = event.detail.value;
                            if (typeof next === 'string') setRange(next as TimeRange);
                          }}
                        >
                          {TIME_RANGES.map((option) => (
                            <IonSegmentButton key={option.value} value={option.value}>
                              <IonLabel>{option.label}</IonLabel>
                            </IonSegmentButton>
                          ))}
                        </IonSegment>
                      </div>
                    </div>
                  </div>

                  <section className="mt-6">
                    <h2 className="text-base! font-semibold!">Tren panen</h2>
                    <p className="text-sm text-base-content/60">
                      Total panen per periode di {garden?.name ?? 'kebun ini'}.
                    </p>
                    <div className="card card-border mt-3 bg-base-100">
                      <div className="card-body p-3">
                        {hasHarvestData ? (
                          <Suspense fallback={<ChartPlaceholder message="Memuat grafik…" />}>
                            <HarvestTrendChart data={harvestData} unit={unit} />
                          </Suspense>
                        ) : (
                          <ChartPlaceholder message="Belum ada panen pada rentang ini. Catat panen dari halaman detail tanaman." />
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="mt-6">
                    <h2 className="text-base! font-semibold!">Masalah tanaman</h2>
                    <p className="text-sm text-base-content/60">
                      Jumlah masalah per periode, dipecah menurut kategori.
                    </p>

                    <div className="mt-3">
                      <IonSegment
                        value={breakdown}
                        onIonChange={(event) => {
                          const next = event.detail.value;
                          if (next === 'severity' || next === 'type') setBreakdown(next);
                        }}
                      >
                        {PROBLEM_BREAKDOWNS.map((option) => (
                          <IonSegmentButton key={option.value} value={option.value}>
                            <IonLabel>{option.label}</IonLabel>
                          </IonSegmentButton>
                        ))}
                      </IonSegment>
                    </div>

                    <div className="card card-border mt-3 bg-base-100">
                      <div className="card-body p-3">
                        {hasProblemData ? (
                          <Suspense fallback={<ChartPlaceholder message="Memuat grafik…" />}>
                            <ProblemTrendChart data={problemData} />
                          </Suspense>
                        ) : (
                          <ChartPlaceholder message="Belum ada masalah pada rentang ini. Catat masalah dari halaman detail tanaman." />
                        )}
                      </div>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Grafik;
