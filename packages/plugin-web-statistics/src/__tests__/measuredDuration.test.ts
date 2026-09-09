import { describe, expect, it } from 'vitest';
import { measuredDurationMs } from '../internal/measuredDuration.js';
import { aggregateRange } from '../internal/aggregators.js';
import { heatmapCells } from '../internal/heatmapCells.js';
import { EMPTY_HABITS_STATE } from '../internal/isHabitsStateRecord.js';
import type { PomodoroSessionRecord } from '../internal/isPomodoroSession.js';

const now = new Date(2026, 8, 9, 12);
const base = { mode: 'focus' as const, durationMs: 1_500_000, finishedAt: new Date(2026, 8, 9, 10).toISOString() };

describe('measured focus duration', () => {
  it.each([undefined, -1, NaN, Infinity, 1_500_001, '60000'])('does not substitute configured time for invalid elapsed %s', elapsedMs => {
    const row = { ...base, elapsedMs } as PomodoroSessionRecord;
    expect(measuredDurationMs(row)).toBeNull();
    const agg = aggregateRange('week', [row], EMPTY_HABITS_STATE, 1, now, 'en');
    expect(agg.kpis.focusMinutesTotal).toBe(0);
    expect(agg.unmeasuredFocusSessions).toBe(1);
  });
  it('zero is measured, not missing', () => {
    const agg = aggregateRange('week', [{ ...base, elapsedMs: 0 }], EMPTY_HABITS_STATE, 1, now, 'en');
    expect(agg.kpis.focusMinutesTotal).toBe(0);
    expect(agg.unmeasuredFocusSessions).toBe(0);
  });
  it('retains subminute work across KPI, buckets, hourly distribution and heatmap', () => {
    const rows = [{ ...base, elapsedMs: 20_000 }, { ...base, elapsedMs: 20_000 }];
    const agg = aggregateRange('week', rows, EMPTY_HABITS_STATE, 1, now, 'en');
    expect(agg.kpis.focusMinutesTotal).toBeCloseTo(2 / 3);
    expect(agg.focusBuckets.reduce((a, b) => a + b)).toBeCloseTo(2 / 3);
    expect(agg.hourDistribution.reduce((a, b) => a + b)).toBeCloseTo(2 / 3);
    expect(heatmapCells(rows, 1, now).find(c => c.date === '2026-09-09')?.minutes).toBeCloseTo(2 / 3);
  });
  it('preserves raw legacy rows and excludes breaks from missing-duration notice', () => {
    const rows: PomodoroSessionRecord[] = [base, { ...base, mode: 'short-break' }];
    const raw = JSON.stringify(rows);
    expect(aggregateRange('week', rows, EMPTY_HABITS_STATE, 1, now, 'en').unmeasuredFocusSessions).toBe(1);
    expect(JSON.stringify(rows)).toBe(raw);
  });
});
