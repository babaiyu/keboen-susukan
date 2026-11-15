import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GardenState {
  activeGardenId: number | null;
  setActiveGarden: (id: number | null) => void;
}

// Persisted to localStorage so the last active garden is restored on relaunch
// (PRD FR-1.4).
export const useGardenStore = create<GardenState>()(
  persist(
    (set) => ({
      activeGardenId: null,
      setActiveGarden: (id) => set({ activeGardenId: id }),
    }),
    { name: 'keboen-active-garden' },
  ),
);
