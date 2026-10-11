import { expect, it } from 'vitest';
import { aggregateRange } from '../internal/aggregators.js';
import { EMPTY_HABITS_STATE } from '../internal/isHabitsStateRecord.js';
import { countDoneTasks } from '../internal/countDoneTasks.js';

const now = new Date(2026, 8, 9, 12);
const at = (day: number) => new Date(2026, 8, day, 9).toISOString();
function aggregate(tasks: unknown) { return aggregateRange('week', [], EMPTY_HABITS_STATE, 1, now, 'en', tasks); }

it('buckets actual completion instants and keeps undated totals separate', () => {
  const tasks = [{ tasks: [
    { done: true, completedAt: at(7) }, { done: true, completedAt: at(8) },
    { done: true }, { done: false, completedAt: at(9) },
    { done: true, completedAt: at(1) },
  ] }];
  const original = JSON.stringify(tasks);
  const value = aggregate(tasks);
  expect(value.kpis.tasksTotal).toBe(4);
  expect(value.taskBuckets).toEqual([1, 1, 0, 0, 0, 0, 0]);
  expect(value.undatedCompletedTasks).toBe(1);
  expect(value.taskSeriesAvailable).toBe(true);
  expect(JSON.stringify(tasks)).toBe(original);
});

it('legacy completed container infers only missing done and never creates completedAt', () => {
  const tasks = [{ tasks: [], completed: [{}, { done: false }, { done: true }] }];
  expect(countDoneTasks(tasks)).toBe(2);
  expect(aggregate(tasks).undatedCompletedTasks).toBe(2);
  expect(aggregate(tasks).taskSeriesAvailable).toBe(false);
});

it('invalid or future timestamps are excluded from historical bars, but totals survive', () => {
  const tasks = [{ tasks: [null, 3, { done: true, completedAt: '9/9' },
    { done: true, completedAt: 'not-a-date' }, { done: true, completedAt: at(10) }] }];
  const value = aggregate(tasks);
  expect(value.kpis.tasksTotal).toBe(3);
  expect(value.undatedCompletedTasks).toBe(3);
  expect(value.taskBuckets.every(n => n === 0)).toBe(true);
});

it('undo removes the event and recompletion uses its new instant, not the old bucket', () => {
  expect(aggregate([{ tasks: [{ done: false }] }]).taskBuckets.every(n => n === 0)).toBe(true);
  expect(aggregate([{ tasks: [{ done: true, completedAt: at(9) }] }]).taskBuckets).toEqual([0, 0, 1, 0, 0, 0, 0]);
});

it.each(['2026-02-30T12:00:00.000Z', '2026-04-31T12:00:00Z', '2026-09-09T24:00:00Z', '2026-09-09T09:00:00'])('does not normalize invalid or timezone-less completion %s', completedAt => {
  const value = aggregate([{ tasks: [{ done: true, completedAt }] }]);
  expect(value.undatedCompletedTasks).toBe(1);
  expect(value.taskBuckets.every(n => n === 0)).toBe(true);
});

it('accepts a real leap day and an explicit offset without changing the instant', () => {
  const tasks = [{ tasks: [{ done: true, completedAt: '2024-02-29T10:00:00.000Z' }, { done: true, completedAt: '2026-09-08T12:00:00+02:00' }] }];
  expect(aggregate(tasks).undatedCompletedTasks).toBe(0);
  expect(aggregate(tasks).taskBuckets.reduce((a, b) => a + b, 0)).toBe(1);
});
