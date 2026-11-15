import Dexie, { type EntityTable } from 'dexie';

import type { Garden, Harvest, Plant, Problem } from './types';

export interface KeboenDB extends Dexie {
  gardens: EntityTable<Garden, 'id'>;
  plants: EntityTable<Plant, 'id'>;
  harvests: EntityTable<Harvest, 'id'>;
  problems: EntityTable<Problem, 'id'>;
}

export const db = new Dexie('keboen-susukan') as KeboenDB;

// Indexes are derived from the query paths in the PRD (FR-2/3/4/5).
// See docs/PRD_SISTEM_MANAJEMEN_KEBUN.md section 8 (data model).
db.version(1).stores({
  gardens: '++id, name',
  plants: '++id, gardenId, name, [gardenId+name]',
  harvests: '++id, plantId, date, [plantId+date]',
  problems: '++id, plantId, date, type, status, [plantId+date]',
});
