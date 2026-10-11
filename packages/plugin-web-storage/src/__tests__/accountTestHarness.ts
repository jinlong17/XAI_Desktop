import { beforeEach } from 'vitest';
import { accountScope } from '../internal/accountScope.js';

// Explicit authenticated account fixture; leaves the browser Storage object intact.
beforeEach(() => { accountScope.activate(accountScope.lock('storage-unit-test'), 'fixture'); });
export const testStorage = {
  getItem(key: string) { return localStorage.getItem(accountScope.physicalKey(key)); },
  setItem(key: string, value: string) { localStorage.setItem(accountScope.physicalKey(key), value); },
  removeItem(key: string) { localStorage.removeItem(accountScope.physicalKey(key)); },
};
