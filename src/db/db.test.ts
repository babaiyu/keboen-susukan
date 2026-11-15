import { beforeEach, describe, expect, it } from 'vitest';

import { db } from './database';
import { createGarden, deleteGarden, listGardens } from './gardens';
import { addHarvest, listHarvestsByGarden, listHarvestsByPlant, totalHarvestByPlant } from './harvests';
import { createPlant, deletePlant, listPlantsByGarden } from './plants';
import { addProblem, listProblemsByGarden, listProblemsByPlant } from './problems';

// Each test starts from an empty database so cascade assertions are exact.
beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('gardens', () => {
  it('creates and lists gardens sorted by name', async () => {
    await createGarden({ name: 'Kebun B' });
    await createGarden({ name: 'Kebun A' });

    const gardens = await listGardens();
    expect(gardens.map((garden) => garden.name)).toEqual(['Kebun A', 'Kebun B']);
  });
});

describe('plant catalog', () => {
  it('lists plants for a garden and filters by name', async () => {
    const gardenId = await createGarden({ name: 'Kebun Utama' });
    await createPlant({ gardenId, name: 'Cabai Rawit' });
    await createPlant({ gardenId, name: 'Selada' });

    const all = await listPlantsByGarden(gardenId);
    expect(all).toHaveLength(2);

    const filtered = await listPlantsByGarden(gardenId, 'cabai');
    expect(filtered.map((plant) => plant.name)).toEqual(['Cabai Rawit']);
  });
});

describe('harvests', () => {
  it('lists harvests newest first and sums the total per plant', async () => {
    const gardenId = await createGarden({ name: 'Kebun Utama' });
    const plantId = await createPlant({ gardenId, name: 'Cabai Rawit' });
    await addHarvest({ plantId, date: '2026-01-01', amount: 1.5, unit: 'kg' });
    await addHarvest({ plantId, date: '2026-01-03', amount: 2, unit: 'kg' });
    await addHarvest({ plantId, date: '2026-01-02', amount: 1, unit: 'kg' });

    const harvests = await listHarvestsByPlant(plantId);
    expect(harvests.map((harvest) => harvest.date)).toEqual(['2026-01-03', '2026-01-02', '2026-01-01']);

    expect(await totalHarvestByPlant(plantId)).toBeCloseTo(4.5);
  });

  it('keeps each plant total separate', async () => {
    const gardenId = await createGarden({ name: 'Kebun Utama' });
    const chilli = await createPlant({ gardenId, name: 'Cabai' });
    const lettuce = await createPlant({ gardenId, name: 'Selada' });
    await addHarvest({ plantId: chilli, date: '2026-02-01', amount: 3, unit: 'kg' });
    await addHarvest({ plantId: lettuce, date: '2026-02-01', amount: 1, unit: 'kg' });

    expect(await totalHarvestByPlant(chilli)).toBe(3);
    expect(await totalHarvestByPlant(lettuce)).toBe(1);
  });

  it('lists every harvest in a garden across its plants, newest first', async () => {
    const gardenId = await createGarden({ name: 'Kebun Utama' });
    const chilli = await createPlant({ gardenId, name: 'Cabai' });
    const lettuce = await createPlant({ gardenId, name: 'Selada' });
    await addHarvest({ plantId: chilli, date: '2026-01-01', amount: 2, unit: 'kg' });
    await addHarvest({ plantId: lettuce, date: '2026-01-03', amount: 3, unit: 'kg' });

    // A second garden proves the join stays scoped to the selected garden.
    const otherGardenId = await createGarden({ name: 'Kebun Lain' });
    const tomato = await createPlant({ gardenId: otherGardenId, name: 'Tomat' });
    await addHarvest({ plantId: tomato, date: '2026-01-05', amount: 9, unit: 'kg' });

    const harvests = await listHarvestsByGarden(gardenId);
    expect(harvests.map((harvest) => harvest.amount)).toEqual([3, 2]);
  });
});

describe('problems', () => {
  it('lists a garden’s problems newest first and filters by type and status', async () => {
    const gardenId = await createGarden({ name: 'Kebun Utama' });
    const chilli = await createPlant({ gardenId, name: 'Cabai' });
    const lettuce = await createPlant({ gardenId, name: 'Selada' });
    await addProblem({
      plantId: chilli,
      date: '2026-01-01',
      type: 'hama',
      severity: 'ringan',
      description: 'Kutu daun',
      status: 'aktif',
    });
    await addProblem({
      plantId: lettuce,
      date: '2026-01-05',
      type: 'penyakit',
      severity: 'sedang',
      description: 'Jamur daun',
      status: 'teratasi',
    });

    const all = await listProblemsByGarden(gardenId);
    expect(all.map((problem) => problem.date)).toEqual(['2026-01-05', '2026-01-01']);

    const pests = await listProblemsByGarden(gardenId, { type: 'hama' });
    expect(pests).toHaveLength(1);
    expect(pests[0].description).toBe('Kutu daun');

    const resolved = await listProblemsByGarden(gardenId, { status: 'teratasi' });
    expect(resolved).toHaveLength(1);
    expect(resolved[0].description).toBe('Jamur daun');
  });
});

describe('cascade deletes', () => {
  it('removes plants, harvests, and problems when a garden is deleted', async () => {
    const gardenId = await createGarden({ name: 'Kebun Utama' });
    const plantId = await createPlant({ gardenId, name: 'Cabai Rawit' });
    await addHarvest({ plantId, date: '2026-01-01', amount: 2, unit: 'kg' });
    await addProblem({
      plantId,
      date: '2026-01-02',
      type: 'hama',
      severity: 'ringan',
      description: 'Kutu daun',
      status: 'aktif',
    });

    await deleteGarden(gardenId);

    expect(await listGardens()).toHaveLength(0);
    expect(await listPlantsByGarden(gardenId)).toHaveLength(0);
    expect(await listHarvestsByPlant(plantId)).toHaveLength(0);
    expect(await listProblemsByPlant(plantId)).toHaveLength(0);
  });

  it('removes harvests and problems when a plant is deleted', async () => {
    const gardenId = await createGarden({ name: 'Kebun Utama' });
    const plantId = await createPlant({ gardenId, name: 'Selada' });
    await addHarvest({ plantId, date: '2026-01-01', amount: 1, unit: 'kg' });
    await addProblem({
      plantId,
      date: '2026-01-02',
      type: 'penyakit',
      severity: 'sedang',
      description: 'Daun menguning',
      status: 'aktif',
    });

    await deletePlant(plantId);

    expect(await listPlantsByGarden(gardenId)).toHaveLength(0);
    expect(await listHarvestsByPlant(plantId)).toHaveLength(0);
    expect(await listProblemsByPlant(plantId)).toHaveLength(0);
  });
});
