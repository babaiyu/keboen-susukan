import Dexie from 'dexie';

import { db } from './database';
import type { Plant, PlantInput, PlantUpdate } from './types';

export async function createPlant(input: PlantInput): Promise<number> {
  const timestamp = Date.now();
  return db.plants.add({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

// Lists plants for one garden, sorted by name. `search` is a simple,
// case-insensitive substring match on the plant name (FR-2.2).
export async function listPlantsByGarden(gardenId: number, search?: string): Promise<Plant[]> {
  const plants = await db.plants
    .where('[gardenId+name]')
    .between([gardenId, Dexie.minKey], [gardenId, Dexie.maxKey])
    .toArray();

  if (!search) return plants;

  const query = search.trim().toLowerCase();
  return plants.filter((plant) => plant.name.toLowerCase().includes(query));
}

export async function getPlant(id: number): Promise<Plant | undefined> {
  return db.plants.get(id);
}

export async function updatePlant(id: number, patch: PlantUpdate): Promise<number> {
  return db.plants.update(id, { ...patch, updatedAt: Date.now() });
}

// Cascade delete: removes the plant and its harvests and problems (FR-2.4).
export async function deletePlant(id: number): Promise<void> {
  await db.transaction('rw', db.plants, db.harvests, db.problems, async () => {
    await db.harvests.where('plantId').equals(id).delete();
    await db.problems.where('plantId').equals(id).delete();
    await db.plants.delete(id);
  });
}
