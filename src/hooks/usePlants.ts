import { useLiveQuery } from 'dexie-react-hooks';

import { getPlant, listPlantsByGarden } from '../db/plants';
import type { Plant } from '../db/types';

/**
 * Live plant catalog for one garden, optionally filtered by name.
 * `undefined` while loading; empty array when no garden is selected.
 */
export function usePlants(gardenId: number | null | undefined, search?: string): Plant[] | undefined {
  return useLiveQuery((): Plant[] | Promise<Plant[]> => {
    if (gardenId == null) return [];
    return listPlantsByGarden(gardenId, search);
  }, [gardenId, search]);
}

/**
 * Live single plant.
 * - `undefined` while loading
 * - `null` when the plant does not exist
 */
export function usePlant(id: number | null | undefined): Plant | null | undefined {
  return useLiveQuery(async () => (id == null ? null : ((await getPlant(id)) ?? null)), [id]);
}
