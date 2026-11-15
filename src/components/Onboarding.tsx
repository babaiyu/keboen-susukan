import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { barChartOutline, cloudOfflineOutline, leafOutline, shieldCheckmarkOutline } from 'ionicons/icons';

interface OnboardingStep {
  icon: string;
  title: string;
  body: string;
}

const STEPS: readonly OnboardingStep[] = [
  {
    icon: leafOutline,
    title: 'Buat kebun dan tambah tanaman',
    body: 'Setiap tanaman punya riwayat panen dan masalahnya sendiri.',
  },
  {
    icon: cloudOfflineOutline,
    title: 'Tetap jalan tanpa internet',
    body: 'Semua data tersimpan di HP ini, jadi bisa dipakai langsung di kebun.',
  },
  {
    icon: barChartOutline,
    title: 'Lihat perkembangan',
    body: 'Grafik panen dan masalah membantu membandingkan hasil tiap musim.',
  },
];

interface OnboardingProps {
  open: boolean;
  onDismiss: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ open, onDismiss }) => (
  <IonModal isOpen={open} onDidDismiss={onDismiss}>
    <IonContent>
      <div className="flex min-h-full flex-col bg-base-200">
        <header className="relative overflow-hidden bg-primary px-6 pb-12 pt-16 text-primary-content">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-white/5" />
          <div className="relative mx-auto flex max-w-md flex-col items-start gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
              <IonIcon icon={leafOutline} className="text-4xl" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl! font-bold! leading-tight">Selamat datang di Keboen</h1>
              <p className="mt-2 text-sm text-primary-content/90">
                Catat kebun, panen, dan masalah tanaman langsung dari HP.
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-md flex-1 px-6 py-6">
          <ul className="flex flex-col gap-3">
            {STEPS.map((step) => (
              <li
                key={step.title}
                className="flex items-start gap-3 rounded-box border border-base-300 bg-base-100 p-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <IonIcon icon={step.icon} className="text-2xl" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-0.5 text-sm text-base-content/60">{step.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 flex items-start gap-2 text-xs text-base-content/60">
            <IonIcon icon={shieldCheckmarkOutline} className="mt-0.5 shrink-0 text-base" aria-hidden="true" />
            Data hanya tersimpan di perangkat ini dan tidak dikirim ke mana-mana.
          </p>
        </main>

        <footer className="mx-auto w-full max-w-md px-6 pb-8">
          <IonButton expand="block" onClick={onDismiss}>
            Mulai
          </IonButton>
        </footer>
      </div>
    </IonContent>
  </IonModal>
);

export default Onboarding;
