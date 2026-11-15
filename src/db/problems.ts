import Dexie from 'dexie';

import { db } from './database';
import type { Problem, ProblemFilter, ProblemInput, ProblemUpdate } from './types';

export async function addProblem(input: ProblemInput): Promise<number> {
  const timestamp = Date.now();
  return db.problems.add({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

// Problem history for one plant, newest first (FR-4.4).
export async function listProblemsByPlant(plantId: number): Promise<Problem[]> {
  return db.problems
    .where('[plantId+date]')
    .between([plantId, Dexie.minKey], [plantId, Dexie.maxKey])
    .reverse()
    .toArray();
}

// All problems across a garden, joined through the garden's plants.
// Sorted by date, newest first. Optional filter by type/severity/status.
export async function listProblemsByGarden(gardenId: number, filter?: ProblemFilter): Promise<Problem[]> {
  const plantIds = await db.plants.where('gardenId').equals(gardenId).primaryKeys();
  if (plantIds.length === 0) return [];

  let problems = await db.problems.where('plantId').anyOf(plantIds).toArray();
  problems.sort((a, b) => {
    if (a.date === b.date) return 0;
    return a.date > b.date ? -1 : 1;
  });

  if (filter?.type) problems = problems.filter((problem) => problem.type === filter.type);
  if (filter?.severity) problems = problems.filter((problem) => problem.severity === filter.severity);
  if (filter?.status) problems = problems.filter((problem) => problem.status === filter.status);

  return problems;
}

export async function getProblem(id: number): Promise<Problem | undefined> {
  return db.problems.get(id);
}

export async function updateProblem(id: number, patch: ProblemUpdate): Promise<number> {
  return db.problems.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteProblem(id: number): Promise<void> {
  await db.problems.delete(id);
}
