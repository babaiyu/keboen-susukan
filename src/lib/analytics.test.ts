import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import type { Harvest, Plant, Problem } from '../db/types';

import { buildHarvestSeries, buildProblemSeries, summarize } from './analytics';

// Fixed "today" so bucket labels and ranges are deterministic.
const NOW = dayjs('2026-11-14');

function makeHarvest(id: number, plantId: number, date: string, amount: number): Harvest {
  return { id, plantId, date, amount, unit: 'kg', createdAt: 0, updatedAt: 0 };
}

function makePlant(id: number, gardenId: number, name: string): Plant {
  return { id, gardenId, name, createdAt: 0, updatedAt: 0 };
}

function makeProblem(
  id: number,
  plantId: number,
  date: string,
  type: Problem['type'],
  severity: Problem['severity'],
  status: Problem['status'],
): Problem {
  return { id, plantId, date, type, severity, description: `masalah ${id}`, status, createdAt: 0, updatedAt: 0 };
}

const harvests: Harvest[] = [
  makeHarvest(1, 1, '2026-11-14', 2),
  makeHarvest(2, 1, '2026-11-08', 1.5),
  makeHarvest(3, 2, '2026-11-10', 4),
  makeHarvest(4, 1, '2026-01-01', 9),
];

const plants: Plant[] = [makePlant(1, 1, 'Cabai'), makePlant(2, 1, 'Selada')];

const problems: Problem[] = [
  makeProblem(1, 1, '2026-11-14', 'hama', 'ringan', 'aktif'),
  makeProblem(2, 1, '2026-11-12', 'hama', 'berat', 'teratasi'),
  makeProblem(3, 2, '2026-11-09', 'penyakit', 'sedang', 'aktif'),
];

describe('buildHarvestSeries', () => {
  it('groups the last 7 days into daily buckets', () => {
    const series = buildHarvestSeries(harvests, '7d', null, NOW);

    expect(series).toHaveLength(7);
    expect(series[0]).toEqual({ label: '8 Nov', value: 1.5 });
    expect(series[2]).toEqual({ label: '10 Nov', value: 4 });
    expect(series[6]).toEqual({ label: '14 Nov', value: 2 });
  });

  it('honours the plant filter', () => {
    const series = buildHarvestSeries(harvests, '7d', 1, NOW);

    expect(series[2].value).toBe(0);
    expect(series[6].value).toBe(2);
    expect(series.reduce((total, point) => total + point.value, 0)).toBeCloseTo(3.5);
  });

  it('produces 30 daily buckets for the 30 day range', () => {
    expect(buildHarvestSeries(harvests, '30d', null, NOW)).toHaveLength(30);
  });

  it('groups the 3 month range into weekly buckets', () => {
    const series = buildHarvestSeries(harvests, '3m', null, NOW);

    expect(series.length).toBeGreaterThanOrEqual(13);
    expect(series.length).toBeLessThanOrEqual(15);
    expect(series.reduce((total, point) => total + point.value, 0)).toBeCloseTo(7.5);
  });

  it('starts "all" at the earliest record and uses monthly buckets', () => {
    const series = buildHarvestSeries(harvests, 'all', 1, NOW);

    expect(series).toHaveLength(11); // Jan..Nov 2026
    expect(series.reduce((total, point) => total + point.value, 0)).toBeCloseTo(12.5);
  });

  it('returns zeroed buckets when there is no data', () => {
    const series = buildHarvestSeries([], '7d', null, NOW);

    expect(series).toHaveLength(7);
    expect(series.every((point) => point.value === 0)).toBe(true);
  });
});

describe('buildProblemSeries', () => {
  it('stacks problems by severity', () => {
    const data = buildProblemSeries(problems, '7d', 'severity', null, NOW);

    expect(data.series.map((series) => series.key)).toEqual(['ringan', 'sedang', 'berat']);
    expect(data.points[6].ringan).toBe(1); // 14 Nov
    expect(data.points[4].berat).toBe(1); // 12 Nov
    expect(data.points[1].sedang).toBe(1); // 9 Nov
  });

  it('stacks problems by type and omits empty categories', () => {
    const data = buildProblemSeries(problems, '7d', 'type', null, NOW);

    expect(data.series.map((series) => series.key)).toEqual(['hama', 'penyakit']);
    expect(data.points[6].hama).toBe(1);
  });

  it('honours the plant filter', () => {
    const data = buildProblemSeries(problems, '7d', 'type', 2, NOW);

    expect(data.series.map((series) => series.key)).toEqual(['penyakit']);
  });
});

describe('summarize', () => {
  it('totals harvest in range and counts plants and active problems', () => {
    const summary = summarize(harvests, plants, problems, '7d', null, NOW);

    expect(summary.totalHarvest).toBeCloseTo(7.5);
    expect(summary.plantCount).toBe(2);
    expect(summary.activeProblemCount).toBe(2);
  });

  it('respects the plant filter', () => {
    const summary = summarize(harvests, plants, problems, '7d', 1, NOW);

    expect(summary.totalHarvest).toBeCloseTo(3.5);
    expect(summary.plantCount).toBe(1);
    expect(summary.activeProblemCount).toBe(1);
  });
});
