import { describe, expect, it } from 'vitest';
import { aggregateRange } from '../../../packages/plugin-web-statistics/src/internal/aggregators';
import { heatmapCells } from '../../../packages/plugin-web-statistics/src/internal/heatmapCells';
import { EMPTY_HABITS_STATE } from '../../../packages/plugin-web-statistics/src/internal/isHabitsStateRecord';

const now = new Date(2026, 8, 9, 12);
const session = (elapsedMs: number) => ({
  id: 'partial', mode: 'focus' as const, durationMs: 1_500_000, elapsedMs,
  startedAt: new Date(2026, 8, 9, 9).toISOString(),
  finishedAt: new Date(2026, 8, 9, 10).toISOString(), completed: false,
});

describe('STAT-01 actual focus duration', () => {
  it('one active minute plus pauses is one minute, not configured 25 or wall-clock 60', () => {
    const value = aggregateRange('week', [session(60_000)], EMPTY_HABITS_STATE, 1, now, 'en');
    expect(value.kpis.focusMinutesTotal).toBe(1);
    expect(value.focusBuckets.reduce((a, b) => a + b, 0)).toBe(1);
    expect(value.hourDistribution.reduce((a, b) => a + b, 0)).toBe(1);
  });
  it('an immediate End with zero elapsed adds no focus time', () => {
    expect(aggregateRange('week', [session(0)], EMPTY_HABITS_STATE, 1, now, 'en').kpis.focusMinutesTotal).toBe(0);
  });
  it('heatmap uses the same measured elapsed time', () => {
    expect(heatmapCells([session(60_000)], 1, now).find(c => c.date === '2026-09-09')?.minutes).toBe(1);
  });
});

describe('STAT-02 undated task completions', () => {
  it('retains current total without inventing a completion in the last date bucket', () => {
    const tasks = [{ id: 'nodate', tasks: [{ id: 'old', done: true }] }];
    const value = aggregateRange('week', [], EMPTY_HABITS_STATE, 1, now, 'en', tasks);
    expect(value.kpis.tasksTotal).toBe(1);
    expect(value.taskBuckets.every(n => n === 0)).toBe(true);
  });
});
