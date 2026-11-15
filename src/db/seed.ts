// Demo data used for judging, user testing, and screenshots (PRD §14: "data
// contoh untuk demo"). It creates one garden with three plants plus harvests
// and problems spread across the last three months, so every Grafik range
// (7 days, 30 days, 3 months, all) has something to show.
//
// The seeder is idempotent: if the demo garden already exists it returns that
// garden instead of creating duplicates.

import dayjs from 'dayjs';

import { db } from './database';
import type { ProblemSeverity, ProblemStatus, ProblemType } from './types';

export const DEMO_GARDEN_NAME = 'Kebun Contoh';

interface HarvestSeed {
  daysAgo: number;
  amount: number;
  grade?: string;
  notes?: string;
}

interface ProblemSeed {
  daysAgo: number;
  type: ProblemType;
  severity: ProblemSeverity;
  status: ProblemStatus;
  description: string;
  action?: string;
}

interface PlantSeed {
  name: string;
  category: string;
  quantity: number;
  plantedDaysAgo: number;
  notes?: string;
  harvests: HarvestSeed[];
  problems: ProblemSeed[];
}

const PLANT_SEEDS: readonly PlantSeed[] = [
  {
    name: 'Cabai Rawit',
    category: 'Sayuran buah',
    quantity: 40,
    plantedDaysAgo: 120,
    notes: 'Ditanam di bedeng 1, dekat pagar.',
    harvests: [
      { daysAgo: 2, amount: 1.5, grade: 'A', notes: 'Panen pagi' },
      { daysAgo: 9, amount: 2, grade: 'A' },
      { daysAgo: 16, amount: 1.2 },
      { daysAgo: 25, amount: 2.4, notes: 'Hasil bagus setelah pemupukan' },
      { daysAgo: 38, amount: 1.8 },
      { daysAgo: 54, amount: 2.1 },
      { daysAgo: 72, amount: 1.6 },
    ],
    problems: [
      {
        daysAgo: 5,
        type: 'hama',
        severity: 'ringan',
        status: 'aktif',
        description: 'Kutu daun di pucuk tanaman',
        action: 'Disemprot sabun insektisida',
      },
      {
        daysAgo: 34,
        type: 'penyakit',
        severity: 'sedang',
        status: 'teratasi',
        description: 'Bercak daun pada beberapa tanaman',
        action: 'Daun terinfeksi dipangkas',
      },
    ],
  },
  {
    name: 'Selada',
    category: 'Sayuran daun',
    quantity: 60,
    plantedDaysAgo: 45,
    notes: 'Bedeng 2, mendapat sinar pagi.',
    harvests: [
      { daysAgo: 1, amount: 3, grade: 'A' },
      { daysAgo: 7, amount: 2.5, grade: 'A' },
      { daysAgo: 14, amount: 3.2 },
      { daysAgo: 21, amount: 2.8 },
      { daysAgo: 29, amount: 3.5 },
      { daysAgo: 36, amount: 2.9 },
    ],
    problems: [
      {
        daysAgo: 11,
        type: 'cuaca',
        severity: 'berat',
        status: 'aktif',
        description: 'Daun layu setelah hujan deras',
        action: 'Bedeng diberi naungan sementara',
      },
      {
        daysAgo: 27,
        type: 'air',
        severity: 'ringan',
        status: 'teratasi',
        description: 'Tanah terlalu kering saat kemarau',
        action: 'Penyiraman ditingkatkan',
      },
    ],
  },
  {
    name: 'Tomat',
    category: 'Sayuran buah',
    quantity: 25,
    plantedDaysAgo: 90,
    notes: 'Ditanam dengan ajir bambu.',
    harvests: [
      { daysAgo: 3, amount: 4, grade: 'A' },
      { daysAgo: 10, amount: 3.5, grade: 'A' },
      { daysAgo: 18, amount: 4.2 },
      { daysAgo: 27, amount: 3.8 },
      { daysAgo: 41, amount: 4.5, notes: 'Panen untuk pasar desa' },
      { daysAgo: 58, amount: 3.2 },
    ],
    problems: [
      {
        daysAgo: 19,
        type: 'penyakit',
        severity: 'sedang',
        status: 'aktif',
        description: 'Jamur pada daun bagian bawah',
        action: 'Daun sakit dibuang dan dibakar',
      },
      {
        daysAgo: 48,
        type: 'nutrisi',
        severity: 'ringan',
        status: 'teratasi',
        description: 'Daun menguning karena kurang nutrisi',
        action: 'Diberi pupuk kompos',
      },
    ],
  },
];

function dateDaysAgo(days: number): string {
  return dayjs().subtract(days, 'day').format('YYYY-MM-DD');
}

/** True when the demo garden already exists. */
export async function hasDemoData(): Promise<boolean> {
  return (await db.gardens.where('name').equals(DEMO_GARDEN_NAME).count()) > 0;
}

/**
 * Creates the demo garden and its plants/harvests/problems atomically.
 * Returns the garden id so the caller can make it active.
 */
export async function seedDemoData(): Promise<number> {
  return db.transaction('rw', db.gardens, db.plants, db.harvests, db.problems, async () => {
    // The existence check lives inside the transaction so two near-simultaneous
    // calls cannot both pass it and insert duplicate demo gardens.
    const existing = await db.gardens.where('name').equals(DEMO_GARDEN_NAME).first();
    if (existing) return existing.id;

    const timestamp = Date.now();

    const gardenId = await db.gardens.add({
      name: DEMO_GARDEN_NAME,
      location: 'Bedeng belakang rumah',
      area: 120,
      areaUnit: 'm²',
      startDate: dayjs().subtract(5, 'month').format('YYYY-MM-DD'),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    for (const seed of PLANT_SEEDS) {
      const plantId = await db.plants.add({
        gardenId,
        name: seed.name,
        category: seed.category,
        quantity: seed.quantity,
        plantDate: dateDaysAgo(seed.plantedDaysAgo),
        notes: seed.notes,
        photo: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      for (const harvest of seed.harvests) {
        await db.harvests.add({
          plantId,
          date: dateDaysAgo(harvest.daysAgo),
          amount: harvest.amount,
          unit: 'kg',
          grade: harvest.grade,
          notes: harvest.notes,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      for (const problem of seed.problems) {
        await db.problems.add({
          plantId,
          date: dateDaysAgo(problem.daysAgo),
          type: problem.type,
          severity: problem.severity,
          description: problem.description,
          action: problem.action,
          status: problem.status,
          photo: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    }

    return gardenId;
  });
}
