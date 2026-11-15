import { useLiveQuery } from 'dexie-react-hooks';

import { getHarvest, listHarvestsByGarden, listHarvestsByPlant, totalHarvestByPlant } from '../db/harvests';
import type { Harvest } from '../db/types';

/**
 * Live harvest history for one plant, newest first (FR-3.3).
 * `undefined` while loading; empty array when no plant is selected.
 */
export function useHarvests(plantId: number | null | undefined): Harvest[] | undefined {
  return useLiveQuery((): Harvest[] | Promise<Harvest[]> => {
    if (plantId == null) return [];
    return listHarvestsByPlant(plantId);
  }, [plantId]);
}

/**
 * Live single harvest record.
 * - `undefined` while loading
 * - `null` when the record does not exist
 */
export function useHarvest(id: number | null | undefined): Harvest | null | undefined {
  return useLiveQuery(async () => (id == null ? null : ((await getHarvest(id)) ?? null)), [id]);
}

/**
 * Live harvest history for every plant in one garden, newest first (FR-5.1).
 * `undefined` while loading; empty array when no garden is selected.
 */
export function useHarvestsByGarden(gardenId: number | null | undefined): Harvest[] | undefined {
  return useLiveQuery((): Harvest[] | Promise<Harvest[]> => {
    if (gardenId == null) return [];
    return listHarvestsByGarden(gardenId);
  }, [gardenId]);
}

/** Live total harvested amount for one plant (FR-3.4). */
export function useTotalHarvest(plantId: number | null | undefined): number {
  return useLiveQuery(async () => (plantId == null ? 0 : totalHarvestByPlant(plantId)), [plantId]) ?? 0;
}
