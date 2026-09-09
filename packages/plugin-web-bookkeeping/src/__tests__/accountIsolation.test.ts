import { expect, it } from 'vitest';
import { accountScope } from '@repo/plugin-web-storage';
import { readBookkeepingState, writeBookkeepingState } from '../internal/storage.js';
it('isolates financial data and rejects a retained previous account writer', () => {
  const a=accountScope.activate(accountScope.lock('A'),'one');
  const state={...readBookkeepingState(),budgetTotal:987654321};
  writeBookkeepingState(state,a);
  accountScope.activate(accountScope.lock('B'),'one');
  expect(readBookkeepingState().budgetTotal).not.toBe(987654321);
  expect(()=>writeBookkeepingState(state,a)).toThrow();
  accountScope.activate(accountScope.lock('A'),'one');
  expect(readBookkeepingState().budgetTotal).toBe(987654321);
});
