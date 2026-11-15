import { beforeEach, describe, expect, it } from 'vitest';

import { db } from './database';
import { DEMO_GARDEN_NAME, hasDemoData, seedDemoData } from './seed';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('seedDemoData', () => {
  it('creates a demo garden with plants, harvests, and problems', async () => {
    const gardenId = await seedDemoData();

    const garden = await db.gardens.get(gardenId);
    expect(garden?.name).toBe(DEMO_GARDEN_NAME);
    expect(await db.plants.where('gardenId').equals(gardenId).count()).toBe(3);
    expect(await db.harvests.count()).toBeGreaterThan(0);
    expect(await db.problems.count()).toBeGreaterThan(0);
    expect(await hasDemoData()).toBe(true);
  });

  it('is idempotent so repeated taps do not duplicate data', async () => {
    const first = await seedDemoData();
    const second = await seedDemoData();

    expect(second).toBe(first);
    expect(await db.gardens.count()).toBe(1);
    expect(await db.plants.count()).toBe(3);
  });
});
