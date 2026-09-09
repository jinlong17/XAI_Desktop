import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuthSessionStorage, createIndexedDbStore } from './storage';
import { createDeviceIdentityStore } from './device-store';

beforeEach(() => vi.stubGlobal('indexedDB', new IDBFactory()));
afterEach(() => vi.unstubAllGlobals());

describe('durable auth database', () => {
  it('supports session then device in the same default database', async () => {
    const session = createAuthSessionStorage();
    await session.setItem('token', 'saved-token');
    const device = createDeviceIdentityStore();
    expect(await device.ensure(() => 'saved-device')).toBe('saved-device');
    expect(await session.getItem('token')).toBe('saved-token');
  });
});

function open(name: string, version?: number, upgrade?: (db: IDBDatabase) => void): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = () => upgrade?.(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('test open blocked'));
  });
}

async function seedV1(store: string) {
  const db = await open('xai-web-auth', 1, db => db.createObjectStore(store));
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put('legacy-value', 'legacy');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return db;
}

it('supports device first and session read/write/delete independently', async () => {
  const device = createDeviceIdentityStore();
  await device.set('device-A');
  const session = createAuthSessionStorage();
  await session.setItem('token', 'token-A');
  await session.removeItem('token');
  expect(await session.getItem('token')).toBeNull();
  expect(await device.get()).toBe('device-A');
  await device.clear();
  expect(await device.get()).toBeNull();
});

it('opens both stores concurrently and shares the schema', async () => {
  const session = createIndexedDbStore();
  const device = createDeviceIdentityStore();
  await Promise.all([session.setItem('token', 'A'), device.set('B')]);
  expect(await session.getItem('token')).toBe('A');
  expect(await device.get()).toBe('B');
  const db = await open('xai-web-auth');
  expect(db.version).toBe(2);
  expect([...db.objectStoreNames]).toEqual(['device', 'session']);
  db.close();
});

it.each(['session', 'device'])('preserves existing v1 %s data during upgrade', async storeName => {
  (await seedV1(storeName)).close();
  const legacy = createIndexedDbStore({ storeName });
  expect(await legacy.getItem('legacy')).toBe('legacy-value');
  await createAuthSessionStorage().setItem('new', 'session');
  await createDeviceIdentityStore().set('device');
  expect(await legacy.getItem('legacy')).toBe('legacy-value');
  const db = await open('xai-web-auth');
  expect(db.version).toBe(2);
  expect([...db.objectStoreNames]).toEqual(['device', 'session']);
  db.close();
});

it('supports custom databases and adds custom stores without losing records', async () => {
  const a = createIndexedDbStore({ dbName: 'custom', storeName: 'alpha' });
  const b = createIndexedDbStore({ dbName: 'custom', storeName: 'beta' });
  await a.setItem('same', 'A');
  await b.setItem('same', 'B');
  expect(await a.getItem('same')).toBe('A');
  expect(await b.getItem('same')).toBe('B');
  await b.removeItem('same');
  expect(await b.getItem('same')).toBeNull();
  const extra = createIndexedDbStore({ storeName: 'custom-auth-store' });
  await extra.setItem('key', 'C');
  expect(await extra.getItem('key')).toBe('C');
  await createDeviceIdentityStore().set('D');
});

it('releases connections on versionchange and reopens after a newer schema', async () => {
  const store = createIndexedDbStore();
  await store.setItem('token', 'preserved');
  const upgraded = await open('xai-web-auth', 3, db => db.createObjectStore('future'));
  upgraded.close();
  expect(await store.getItem('token')).toBe('preserved');
  await store.setItem('token', 'updated');
  expect(await store.getItem('token')).toBe('updated');
});

it('rejects blocked upgrades promptly and retries after the old tab closes', async () => {
  const oldTab = await seedV1('session');
  const store = createIndexedDbStore();
  await expect(store.getItem('legacy')).rejects.toThrow(/blocked/);
  oldTab.close();
  expect(await store.getItem('legacy')).toBe('legacy-value');
  await createDeviceIdentityStore().set('new-device');
  // All rejected late open requests must release their connection too.
  const upgraded = await open('xai-web-auth', 3);
  upgraded.close();
});

it('retries a failed open request instead of caching a rejected promise', async () => {
  const realOpen = indexedDB.open.bind(indexedDB);
  vi.spyOn(indexedDB, 'open').mockImplementationOnce(() => {
    const request = { error: new DOMException('Temporary failure', 'UnknownError') } as IDBOpenDBRequest;
    queueMicrotask(() => request.onerror?.call(request, new Event('error')));
    return request;
  }).mockImplementation(realOpen);
  const store = createIndexedDbStore();
  await expect(store.getItem('token')).rejects.toThrow('Temporary failure');
  await store.setItem('token', 'retry-ok');
  expect(await store.getItem('token')).toBe('retry-ok');
});

it('closes a late successful connection after a blocked request has rejected', async () => {
  const realOpen = indexedDB.open.bind(indexedDB);
  const close = vi.fn();
  let request: IDBOpenDBRequest;
  vi.spyOn(indexedDB, 'open').mockImplementationOnce(() => {
    request = { result: { close } } as unknown as IDBOpenDBRequest;
    queueMicrotask(() => request.onblocked?.call(request, new Event('blocked') as IDBVersionChangeEvent));
    return request;
  }).mockImplementation(realOpen);
  const store = createIndexedDbStore();
  await expect(store.getItem('token')).rejects.toThrow(/blocked/);
  request!.onsuccess?.call(request!, new Event('success'));
  expect(close).toHaveBeenCalledOnce();
  await store.setItem('token', 'retry');
  expect(await store.getItem('token')).toBe('retry');
});

it('keeps an existing store operation valid while another caller adds a custom store', async () => {
  const a = createIndexedDbStore({ dbName: 'warm-custom', storeName: 'alpha' });
  await a.setItem('old', 'preserved');
  const b = createIndexedDbStore({ dbName: 'warm-custom', storeName: 'beta' });
  await Promise.all([a.setItem('new', 'A'), b.setItem('new', 'B')]);
  expect(await a.getItem('old')).toBe('preserved');
  expect(await a.getItem('new')).toBe('A');
  expect(await b.getItem('new')).toBe('B');
});
