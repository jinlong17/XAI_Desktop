import { IDBFactory, IDBObjectStore } from '../../../packages/web-auth-device-session/node_modules/fake-indexeddb/build/esm/index.js';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createIndexedDbStore } from '../../../packages/web-auth-device-session/src/storage';
beforeEach(() => vi.stubGlobal('indexedDB', new IDBFactory()));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it('releases queued operations after a synchronous callback failure', async () => {
  const a=createIndexedDbStore({dbName:'queue-sync',storeName:'a'});
  await a.setItem('warm','yes');
  const b=createIndexedDbStore({dbName:'queue-sync',storeName:'b'});
  const bad=a.setItem(undefined as unknown as string,'invalid');
  const good=b.setItem('ok','after-failure');
  await expect(bad).rejects.toThrow();
  await good;
  expect(await a.getItem('warm')).toBe('yes');
  expect(await b.getItem('ok')).toBe('after-failure');
});
it('waits for transaction completion and releases the queue after transaction abort', async () => {
  const a=createIndexedDbStore({dbName:'queue-abort',storeName:'a'});
  await a.setItem('warm','yes');
  const original=IDBObjectStore.prototype.put;
  vi.spyOn(IDBObjectStore.prototype,'put').mockImplementationOnce(function(value, key) {
    const request=original.call(this,value,key);
    this.transaction.abort();
    return request;
  });
  const bad=a.setItem('aborted','no');
  const good=a.setItem('after','yes');
  await expect(bad).rejects.toBeDefined();
  await good;
  expect(await a.getItem('aborted')).toBeNull();
  expect(await a.getItem('after')).toBe('yes');
});
it('keeps reads safe while a newly requested store upgrades a warm database', async () => {
  const a=createIndexedDbStore({dbName:'queue-read',storeName:'a'});
  await a.setItem('warm','yes');
  const b=createIndexedDbStore({dbName:'queue-read',storeName:'b'});
  const [value]=await Promise.all([a.getItem('warm'), b.setItem('new','B')]);
  expect(value).toBe('yes');
  expect(await b.getItem('new')).toBe('B');
});
