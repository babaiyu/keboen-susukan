import { useLiveQuery } from 'dexie-react-hooks';

import { getGarden, listGardens } from '../db/gardens';
import type { Garden } from '../db/types';

/** Live list of gardens, sorted by name. `undefined` while loading. */
export function useGardens(): Garden[] | undefined {
  return useLiveQuery(() => listGardens(), []);
}

/**
 * Live single garden.
 * - `undefined` while loading
 * - `null` when the garden does not exist
 */
export function useGarden(id: number | null | undefined): Garden | null | undefined {
  return useLiveQuery(async () => (id == null ? null : ((await getGarden(id)) ?? null)), [id]);
}
