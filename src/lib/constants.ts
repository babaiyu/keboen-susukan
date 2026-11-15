// Shared option lists for the MVP forms. Keeping them in one place means
// selects, filters, and badges stay in sync as the app grows.

import type { ProblemSeverity, ProblemStatus, ProblemType } from '../db/types';

export const PLANT_CATEGORIES = [
  'Sayuran daun',
  'Sayuran buah',
  'Sayuran umbi',
  'Rempah & herba',
  'Buah-buahan',
  'Lainnya',
] as const;

export const AREA_UNITS = ['m²', 'hektar', 'are', 'tumbak'] as const;

// PRD §15 fixes the harvest unit to "kg" for the MVP. Stored on every harvest
// so mixed units can be introduced later without a migration.
export const HARVEST_UNITS = ['kg'] as const;

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export const PROBLEM_TYPES: readonly SelectOption<ProblemType>[] = [
  { value: 'hama', label: 'Hama' },
  { value: 'penyakit', label: 'Penyakit' },
  { value: 'cuaca', label: 'Cuaca' },
  { value: 'air', label: 'Kekurangan air' },
  { value: 'nutrisi', label: 'Kekurangan nutrisi' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const PROBLEM_SEVERITIES: readonly SelectOption<ProblemSeverity>[] = [
  { value: 'ringan', label: 'Ringan' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'berat', label: 'Berat' },
];

export const PROBLEM_STATUSES: readonly SelectOption<ProblemStatus>[] = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'teratasi', label: 'Teratasi' },
];

/** Human-readable label for a stored enum value, with a safe fallback. */
export function optionLabel<T extends string>(options: readonly SelectOption<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export type PlantCategory = (typeof PLANT_CATEGORIES)[number];
export type AreaUnit = (typeof AREA_UNITS)[number];
