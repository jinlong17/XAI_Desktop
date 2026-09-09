import { expect, it } from 'vitest';
import { accountScope } from '@repo/plugin-web-storage';
import { readTimeTrackerEntries, writeTimeTrackerEntries } from '../internal/storage.js';
it('isolates time entries and rejects a retained previous account writer', () => {
  const a=accountScope.activate(accountScope.lock('A'),'one');
  const entry={id:'private-A',categoryId:'work',subId:null,segments:[{start:1000,end:2000}],note:{en:'A secret',zh:'A'},done:true,createdAt:1000,updatedAt:2000};
  writeTimeTrackerEntries([entry],a);
  accountScope.activate(accountScope.lock('B'),'one');
  expect(readTimeTrackerEntries()).toEqual([]);
  expect(()=>writeTimeTrackerEntries([entry],a)).toThrow();
  accountScope.activate(accountScope.lock('A'),'one');
  expect(readTimeTrackerEntries()[0]?.note.en).toBe('A secret');
});
