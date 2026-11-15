import { db } from './database';
import type { Garden, GardenInput, GardenUpdate } from './types';

export async function createGarden(input: GardenInput): Promise<number> {
  const timestamp = Date.now();
  return db.gardens.add({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

export async function listGardens(): Promise<Garden[]> {
  return db.gardens.orderBy('name').toArray();
}

export async function getGarden(id: number): Promise<Garden | undefined> {
  return db.gardens.get(id);
}

export async function updateGarden(id: number, patch: GardenUpdate): Promise<number> {
  return db.gardens.update(id, { ...patch, updatedAt: Date.now() });
}

// Cascade delete: removes the garden, its plants, and every harvest/problem
// belonging to those plants. Runs atomically inside a single transaction.
export async function deleteGarden(id: number): Promise<void> {
  await db.transaction('rw', db.gardens, db.plants, db.harvests, db.problems, async () => {
    const plantIds = await db.plants.where('gardenId').equals(id).primaryKeys();
    if (plantIds.length > 0) {
      await db.harvests.where('plantId').anyOf(plantIds).delete();
      await db.problems.where('plantId').anyOf(plantIds).delete();
    }
    await db.plants.where('gardenId').equals(id).delete();
    await db.gardens.delete(id);
  });
}
