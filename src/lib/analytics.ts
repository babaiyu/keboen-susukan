// Chart data helpers for the Grafik tab (FR-5).
//
// Everything here is pure and framework-free so the bucketing rules can be
// unit-tested without a browser or IndexedDB. Dates arrive as `YYYY-MM-DD`
// strings (see db/types.ts) and are grouped into day/week/month buckets.

import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/id';

import type { Harvest, Plant, Problem, ProblemSeverity, ProblemType } from '../db/types';

import { PROBLEM_TYPES } from './constants';

// Rendering Indonesian month/day names for chart labels.
dayjs.locale('id');

export type TimeRange = '7d' | '30d' | '3m' | 'all';
export type ProblemBreakdown = 'severity' | 'type';
type Granularity = 'day' | 'week' | 'month';

export interface HarvestDatum {
  label: string;
  value: number;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

export interface ProblemDatum {
  label: string;
  [key: string]: string | number;
}

export interface ProblemChartData {
  points: ProblemDatum[];
  series: ChartSeries[];
}

export interface ChartSummary {
  totalHarvest: number;
  plantCount: number;
  activeProblemCount: number;
}

export const TIME_RANGES: readonly { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 hari' },
  { value: '30d', label: '30 hari' },
  { value: '3m', label: '3 bulan' },
  { value: 'all', label: 'Semua' },
];

export const PROBLEM_BREAKDOWNS: readonly { value: ProblemBreakdown; label: string }[] = [
  { value: 'severity', label: 'Keparahan' },
  { value: 'type', label: 'Jenis' },
];

// Chart colors follow the DESIGN.md badge palette: calm blue → amber → red for
// severity, and a distinct hue per problem type so stacked bars stay readable.
const SEVERITY_SERIES: readonly ChartSeries[] = [
  { key: 'ringan', label: 'Ringan', color: '#0284c7' },
  { key: 'sedang', label: 'Sedang', color: '#f59e0b' },
  { key: 'berat', label: 'Berat', color: '#dc2626' },
];

const TYPE_COLORS: Record<ProblemType, string> = {
  hama: '#f59e0b',
  penyakit: '#dc2626',
  cuaca: '#38bdf8',
  air: '#2563eb',
  nutrisi: '#7c3aed',
  lainnya: '#64748b',
};

// Labels come from the shared option list so the chart legend and the form
// badges/filters never drift apart. Only the colors are chart-specific.
const TYPE_SERIES: readonly ChartSeries[] = PROBLEM_TYPES.map(({ value, label }) => ({
  key: value,
  label,
  color: TYPE_COLORS[value],
}));

interface Bucket {
  key: string;
  label: string;
}

function granularityForRange(range: TimeRange): Granularity {
  switch (range) {
    case '7d':
    case '30d':
      return 'day';
    case '3m':
      return 'week';
    case 'all':
      return 'month';
  }
}

function bucketKey(date: Dayjs, granularity: Granularity): string {
  if (granularity === 'day') return date.startOf('day').format('YYYY-MM-DD');
  if (granularity === 'week') return date.startOf('week').format('YYYY-MM-DD');
  return date.startOf('month').format('YYYY-MM');
}

function bucketLabel(start: Dayjs, granularity: Granularity): string {
  if (granularity === 'month') return start.format('MMM YYYY');
  return start.format('D MMM');
}

function startForRange(range: TimeRange, earliest: Dayjs | undefined, now: Dayjs): Dayjs {
  switch (range) {
    case '7d':
      return now.subtract(6, 'day').startOf('day');
    case '30d':
      return now.subtract(29, 'day').startOf('day');
    case '3m':
      return now.subtract(3, 'month').startOf('day');
    case 'all':
      return earliest ? earliest.startOf('day') : now.startOf('day');
  }
}

/** Earliest `YYYY-MM-DD` in a list, as a dayjs instance. */
function earliestDate(records: readonly { date: string }[]): Dayjs | undefined {
  if (records.length === 0) return undefined;
  let earliest = records[0].date;
  for (const record of records) {
    if (record.date < earliest) earliest = record.date;
  }
  return dayjs(earliest);
}

/**
 * Builds a continuous list of empty buckets for the selected range so the
 * chart never jumps between distant dates. Buckets before the first record
 * (for "all") or after today are excluded naturally by the key map.
 */
function generateBuckets(range: TimeRange, earliest: Dayjs | undefined, now: Dayjs): Bucket[] {
  const granularity = granularityForRange(range);
  let cursor = startForRange(range, earliest, now);
  if (granularity !== 'day') cursor = cursor.startOf(granularity);

  const buckets: Bucket[] = [];
  const end = now.endOf('day');

  while (!cursor.isAfter(end)) {
    buckets.push({ key: bucketKey(cursor, granularity), label: bucketLabel(cursor, granularity) });
    cursor = cursor.add(1, granularity);
  }

  return buckets;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Harvest total (kg) per period for the selected range (FR-5.1/FR-5.2).
 * Pass `plantId` to focus on one plant, or `null` for every plant in the garden.
 */
export function buildHarvestSeries(
  harvests: readonly Harvest[],
  range: TimeRange,
  plantId: number | null = null,
  now: Dayjs = dayjs(),
): HarvestDatum[] {
  const filtered = plantId == null ? harvests : harvests.filter((harvest) => harvest.plantId === plantId);
  const granularity = granularityForRange(range);
  const buckets = generateBuckets(range, earliestDate(filtered), now);
  const index = new Map(buckets.map((bucket, position) => [bucket.key, position]));
  const totals = buckets.map(() => 0);

  for (const harvest of filtered) {
    const position = index.get(bucketKey(dayjs(harvest.date), granularity));
    if (position == null) continue;
    totals[position] += harvest.amount;
  }

  return buckets.map((bucket, position) => ({ label: bucket.label, value: round(totals[position]) }));
}

/**
 * Problem count per period, stacked by severity or type (FR-5.3).
 * Categories with no problems in the range are omitted to keep the legend lean.
 */
export function buildProblemSeries(
  problems: readonly Problem[],
  range: TimeRange,
  breakdown: ProblemBreakdown,
  plantId: number | null = null,
  now: Dayjs = dayjs(),
): ProblemChartData {
  const filtered = plantId == null ? problems : problems.filter((problem) => problem.plantId === plantId);
  const granularity = granularityForRange(range);
  const buckets = generateBuckets(range, earliestDate(filtered), now);
  const index = new Map(buckets.map((bucket, position) => [bucket.key, position]));
  const categories = breakdown === 'severity' ? SEVERITY_SERIES : TYPE_SERIES;

  const counts = buckets.map(() => {
    const row: Record<string, number> = {};
    for (const category of categories) row[category.key] = 0;
    return row;
  });

  for (const problem of filtered) {
    const position = index.get(bucketKey(dayjs(problem.date), granularity));
    if (position == null) continue;
    const category: ProblemSeverity | ProblemType = breakdown === 'severity' ? problem.severity : problem.type;
    counts[position][category] = (counts[position][category] ?? 0) + 1;
  }

  const series = categories.filter((category) => counts.some((row) => (row[category.key] ?? 0) > 0));
  const points = buckets.map((bucket, position) => {
    const point: ProblemDatum = { label: bucket.label };
    for (const category of series) point[category.key] = counts[position][category.key] ?? 0;
    return point;
  });

  return { points, series };
}

/**
 * Summary numbers for the selected garden (FR-5.4). Harvest totals respect the
 * range/plant filters so they match the chart; "aktif" is a current-state count.
 */
export function summarize(
  harvests: readonly Harvest[],
  plants: readonly Plant[],
  problems: readonly Problem[],
  range: TimeRange,
  plantId: number | null = null,
  now: Dayjs = dayjs(),
): ChartSummary {
  const relevantHarvests = plantId == null ? harvests : harvests.filter((harvest) => harvest.plantId === plantId);
  const granularity = granularityForRange(range);
  const buckets = generateBuckets(range, earliestDate(relevantHarvests), now);
  const inRange = new Set(buckets.map((bucket) => bucket.key));

  const totalHarvest = relevantHarvests.reduce(
    (total, harvest) => (inRange.has(bucketKey(dayjs(harvest.date), granularity)) ? total + harvest.amount : total),
    0,
  );

  return {
    totalHarvest: round(totalHarvest),
    plantCount: plantId == null ? plants.length : plants.filter((plant) => plant.id === plantId).length,
    activeProblemCount: problems.filter(
      (problem) => problem.status === 'aktif' && (plantId == null || problem.plantId === plantId),
    ).length,
  };
}

/** Human-readable label for a range value, e.g. "30 hari". */
export function timeRangeLabel(range: TimeRange): string {
  return TIME_RANGES.find((option) => option.value === range)?.label ?? range;
}
