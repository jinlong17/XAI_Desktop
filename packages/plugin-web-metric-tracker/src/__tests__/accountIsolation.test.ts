import { expect, it } from 'vitest';
import { accountScope } from '@repo/plugin-web-storage';
import { readMetricTrackerState, writeMetricTrackerState } from '../internal/storage.js';
it('isolates metric profiles and rejects a retained previous account writer', () => {
  const a=accountScope.activate(accountScope.lock('A'),'one');
  const old=readMetricTrackerState();
  const state={...old,profile:{...old.profile,targetWeightKg:123.45}};
  writeMetricTrackerState(state,a);
  accountScope.activate(accountScope.lock('B'),'one');
  expect(readMetricTrackerState().profile.targetWeightKg).not.toBe(123.45);
  expect(()=>writeMetricTrackerState(state,a)).toThrow();
  accountScope.activate(accountScope.lock('A'),'one');
  expect(readMetricTrackerState().profile.targetWeightKg).toBe(123.45);
});
