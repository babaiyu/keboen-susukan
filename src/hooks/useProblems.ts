import { useLiveQuery } from 'dexie-react-hooks';

import { getProblem, listProblemsByGarden, listProblemsByPlant } from '../db/problems';
import type { Problem } from '../db/types';

/**
 * Live problem history for one plant, newest first (FR-4.4).
 * `undefined` while loading; empty array when no plant is selected.
 */
export function useProblems(plantId: number | null | undefined): Problem[] | undefined {
  return useLiveQuery((): Problem[] | Promise<Problem[]> => {
    if (plantId == null) return [];
    return listProblemsByPlant(plantId);
  }, [plantId]);
}

/**
 * Live problem history for every plant in one garden, newest first (FR-5.3).
 * `undefined` while loading; empty array when no garden is selected.
 */
export function useProblemsByGarden(gardenId: number | null | undefined): Problem[] | undefined {
  return useLiveQuery((): Problem[] | Promise<Problem[]> => {
    if (gardenId == null) return [];
    return listProblemsByGarden(gardenId);
  }, [gardenId]);
}

/**
 * Live single problem record.
 * - `undefined` while loading
 * - `null` when the record does not exist
 */
export function useProblem(id: number | null | undefined): Problem | null | undefined {
  return useLiveQuery(async () => (id == null ? null : ((await getProblem(id)) ?? null)), [id]);
}
