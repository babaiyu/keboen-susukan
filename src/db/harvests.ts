import Dexie from 'dexie';

import { db } from './database';
import type { Harvest, HarvestInput, HarvestUpdate } from './types';

export async function addHarvest(input: HarvestInput): Promise<number> {
  const timestamp = Date.now();
  return db.harvests.add({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

// Harvest history for one plant, newest first (FR-3.3).
export async function listHarvestsByPlant(plantId: number): Promise<Harvest[]> {
  return db.harvests
    .where('[plantId+date]')
    .between([plantId, Dexie.minKey], [plantId, Dexie.maxKey])
    .reverse()
    .toArray();
}

// All harvests across a garden, joined through the garden's plants.
// Sorted by date, newest first, mirroring `listProblemsByGarden` (FR-5.1).
export async function listHarvestsByGarden(gardenId: number): Promise<Harvest[]> {
  const plantIds = await db.plants.where('gardenId').equals(gardenId).primaryKeys();
  if (plantIds.length === 0) return [];

  const harvests = await db.harvests.where('plantId').anyOf(plantIds).toArray();
  harvests.sort((a, b) => {
    if (a.date === b.date) return 0;
    return a.date > b.date ? -1 : 1;
  });

  return harvests;
}

export async function getHarvest(id: number): Promise<Harvest | undefined> {
  return db.harvests.get(id);
}

export async function updateHarvest(id: number, patch: HarvestUpdate): Promise<number> {
  return db.harvests.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteHarvest(id: number): Promise<void> {
  await db.harvests.delete(id);
}

// Sums amounts. Safe for now because the MVP fixes the harvest unit to "kg"
// (PRD §15). Revisit if mixed units are ever allowed.
export async function totalHarvestByPlant(plantId: number): Promise<number> {
  const harvests = await db.harvests.where('plantId').equals(plantId).toArray();
  return harvests.reduce((total, harvest) => total + harvest.amount, 0);
}
