import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory, IDBKeyRange, IDBObjectStore } from 'fake-indexeddb';
import { createAuthGenerationStore, AuthGenerationStorageError } from './auth-generation-store';
import { createIndexedDbStore } from './storage';

beforeEach(() => { vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const A = { generation: 'login-a' };
const B = { generation: 'login-b' };
const C = { generation: 'login-c' };
async function activeA() {
  const store = createAuthGenerationStore();
  expect(await store.createCandidate(A)).toEqual({ status: 'applied' });
  expect(await store.setItem(A, 'session', 'original-A')).toEqual({ status: 'applied' });
  expect(await store.publish({ lease: A, owner: 'account-A', expectedActive: null })).toEqual({ status: 'applied' });
  return store;
}

describe('atomic auth generation participant', () => {
  it('does not require a known owner until publication and never reuses revoked IDs', async () => {
    const store = createAuthGenerationStore();
    expect(await store.createCandidate(A)).toEqual({ status: 'applied' });
    await store.setItem(A, 'session', 'candidate-bytes');
    expect(await store.readActive()).toBeNull();
    expect(await store.getItem(A, 'session')).toBe('candidate-bytes');
    expect(await store.cancelCandidate(A)).toEqual({ status: 'applied' });
    expect(await store.createCandidate(A)).toMatchObject({ status: 'superseded', reason: 'generation-exists' });
    expect(await store.setItem(A, 'session', 'late')).toMatchObject({ status: 'superseded', reason: 'lease-revoked' });
    expect(await store.readRecovery()).toEqual([{ generation: A.generation, owner: null, state: 'revoked' }]);
  });

  it('publishes exactly one winner when two clients compare against A', async () => {
    const first = await activeA();
    const second = createAuthGenerationStore();
    await first.createCandidate(B); await second.createCandidate(C);
    const results = await Promise.all([
      first.publish({ lease: B, owner: 'account-B', expectedActive: A.generation }),
      second.publish({ lease: C, owner: 'account-C', expectedActive: A.generation })
    ]);
    expect(results.filter(result => result.status === 'applied')).toHaveLength(1);
    expect(results.filter(result => result.status === 'superseded')).toEqual([{ status: 'superseded', reason: 'active-changed' }]);
    const active = await second.readActive();
    expect(['login-b', 'login-c']).toContain(active?.generation);
    expect(await first.setItem(A, 'session', 'late-refresh')).toMatchObject({ status: 'superseded', reason: 'active-changed' });
    expect(await first.getItem(A, 'session')).toBeNull();
  });

  it('old revoke cannot alter B pointer/bytes and current revoke remains durable/idempotent', async () => {
    const store = await activeA();
    await store.createCandidate(B); await store.setItem(B, 'session', 'B-exact');
    await store.publish({ lease: B, owner: 'account-B', expectedActive: A.generation });
    expect(await store.revoke({ ...A, owner: 'account-A' })).toEqual({ status: 'applied' });
    expect(await store.readActive()).toEqual({ ...B, owner: 'account-B' });
    expect(await store.getItem(B, 'session')).toBe('B-exact');
    expect(await store.removeItem(A, 'session')).toMatchObject({ status: 'superseded', reason: 'lease-revoked' });
    expect(await store.revoke({ ...B, owner: 'account-A' })).toMatchObject({ status: 'superseded', reason: 'owner-mismatch' });
    expect(await store.revoke({ ...B, owner: 'account-B' })).toEqual({ status: 'applied' });
    expect(await store.revoke({ ...B, owner: 'account-B' })).toEqual({ status: 'applied' });
    const reopened = createAuthGenerationStore();
    expect(await reopened.readActive()).toBeNull();
    expect(await reopened.getItem(B, 'session')).toBeNull();
    expect(JSON.stringify(await reopened.readRecovery())).not.toContain('exact');
  });

  it('requires owner for published revoke and cannot cancel/rebind a published generation', async () => {
    const store = await activeA();
    expect(await store.cancelCandidate(A)).toMatchObject({ status: 'superseded', reason: 'not-candidate' });
    expect(await store.revoke({ ...A, owner: '' })).toMatchObject({ status: 'failed', reason: 'invalid-input' });
    expect(await store.publish({ lease: A, owner: 'other', expectedActive: A.generation })).toMatchObject({ status: 'superseded', reason: 'owner-mismatch' });
    expect(await store.getItem(A, 'session')).toBe('original-A');
  });

  it('revocation racing writes leaves no resurrected session', async () => {
    const store = await activeA();
    const other = createAuthGenerationStore();
    await Promise.all([store.revoke({ ...A, owner: 'account-A' }), other.setItem(A, 'session', 'stale-refresh')]);
    expect(await other.readActive()).toBeNull();
    expect(await other.getItem(A, 'session')).toBeNull();
    expect(await other.setItem(A, 'session', 'even-later')).toMatchObject({ reason: 'lease-revoked' });
  });

  it('transaction abort leaves pointer, rows and lease unchanged', async () => {
    const store = await activeA();
    const original = IDBObjectStore.prototype.put;
    const fault = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, value, key) {
      const request = original.call(this, value, key);
      this.transaction.abort();
      return request;
    });
    expect(await store.revoke({ ...A, owner: 'account-A' })).toEqual({ status: 'failed', reason: 'transaction-failed' });
    fault.mockRestore();
    expect(await store.readActive()).toEqual({ ...A, owner: 'account-A' });
    expect(await store.getItem(A, 'session')).toBe('original-A');
    expect(await store.readRecovery()).toEqual([]);
  });

  it('failed publication does not bind candidate owner or advance pointer', async () => {
    const store = await activeA(); await store.createCandidate(B);
    const original = IDBObjectStore.prototype.put;
    const fault = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, value, key) {
      const request = original.call(this, value, key); if (String(key).endsWith(':active')) this.transaction.abort(); return request;
    });
    expect(await store.publish({ lease: B, owner: 'account-B', expectedActive: A.generation })).toMatchObject({ status: 'failed' });
    fault.mockRestore();
    expect(await store.readActive()).toEqual({ ...A, owner: 'account-A' });
    expect(await store.cancelCandidate(B)).toEqual({ status: 'applied' });
  });

  it('copies exact legacy bytes atomically and preserves legacy plus device rows', async () => {
    const raw = '  { "user" : {"id":"A"}, "opaque":"synthetic" }\n';
    const legacy = createIndexedDbStore(); const device = createIndexedDbStore({ storeName: 'device' });
    await legacy.setItem('old-auth', raw); await device.setItem('identity', 'device-original');
    const store = createAuthGenerationStore(); await store.createCandidate(A);
    expect(await store.importLegacy({ lease: A, owner: 'account-A', expectedActive: null, legacyKey: 'old-auth', expectedRaw: raw, destinationKey: 'new-auth' })).toEqual({ status: 'applied' });
    expect(await store.getItem(A, 'new-auth')).toBe(raw);
    await store.revoke({ ...A, owner: 'account-A' });
    expect(await legacy.getItem('old-auth')).toBe(raw);
    expect(await store.readLegacyImport('old-auth')).toEqual({ ...A, owner: 'account-A' });
    expect(await device.getItem('identity')).toBe('device-original');
    await store.createCandidate(B);
    expect(await store.importLegacy({ lease: B, owner: 'account-A', expectedActive: null, legacyKey: 'old-auth', expectedRaw: raw, destinationKey: 'new-auth' })).toMatchObject({ reason: 'legacy-already-imported' });
    expect(await store.readActive()).toBeNull();
  });

  it('legacy changes prevent copy/publish without damaging the candidate', async () => {
    const legacy = createIndexedDbStore(); await legacy.setItem('old-auth', 'newer-bytes');
    const store = createAuthGenerationStore(); await store.createCandidate(A);
    expect(await store.importLegacy({ lease: A, owner: 'account-A', expectedActive: null, legacyKey: 'old-auth', expectedRaw: 'old-bytes', destinationKey: 'new-auth' })).toMatchObject({ status: 'superseded', reason: 'legacy-changed' });
    expect(await store.readActive()).toBeNull(); expect(await store.getItem(A, 'new-auth')).toBeNull();
    expect(await legacy.getItem('old-auth')).toBe('newer-bytes');
  });

  it('isolates custom namespaces and captures mutable caller lease before awaiting', async () => {
    const first = createAuthGenerationStore({ storageKey: 'first' });
    const second = createAuthGenerationStore({ storageKey: 'second' });
    await first.createCandidate(A); await first.createCandidate(B); await second.createCandidate(A);
    const mutable = { ...A }; const pending = first.setItem(mutable, '__proto__', 'exact-value'); mutable.generation = B.generation;
    expect(await pending).toEqual({ status: 'applied' });
    expect(await first.getItem(A, '__proto__')).toBe('exact-value');
    expect(await first.getItem(B, '__proto__')).toBeNull();
    expect(await second.getItem(A, '__proto__')).toBeNull();
  });

  it('storage unavailability rejects reads and returns failed mutations', async () => {
    vi.stubGlobal('indexedDB', { open() { throw new DOMException('denied', 'SecurityError'); } });
    const store = createAuthGenerationStore();
    expect(await store.createCandidate(A)).toEqual({ status: 'failed', reason: 'transaction-failed' });
    await expect(store.readActive()).rejects.toBeInstanceOf(AuthGenerationStorageError);
    await expect(store.getItem(A, 'session')).rejects.toBeInstanceOf(AuthGenerationStorageError);
  });
});

describe('corrupt generation metadata fails closed', () => {
  const prefix = 'xai.auth-generation.v1:xai-web-auth:';
  async function putRaw(key: string, value: unknown) {
    const { createIndexedDbTransactionStore } = await import('./storage');
    await createIndexedDbTransactionStore()('readwrite', store => new Promise<void>((resolve, reject) => {
      store.transaction.oncomplete = () => resolve(); store.transaction.onabort = () => reject(Error('fixture abort'));
      store.put(value, key);
    }));
  }
  it.each([
    { version: 99, generation: A.generation, owner: null, state: 'candidate', entries: [] },
    { version: 1, generation: B.generation, owner: null, state: 'candidate', entries: [] },
    { version: 1, generation: A.generation, owner: null, state: 'unknown', entries: [] },
    { version: 1, generation: A.generation, owner: null, state: 'candidate', entries: [['session', 123]] },
    { version: 1, generation: A.generation, owner: 'wrong-owner', state: 'candidate', entries: [] },
    { version: 1, generation: A.generation, owner: 'account-A', state: 'revoked', entries: [['session', 'retained']] },
    { version: 1, generation: A.generation, owner: null, state: 'candidate', entries: [], sessionOwner: 'account-A' },
    { version: 1, generation: A.generation, owner: 'account-A', state: 'active', entries: [], sessionOwner: 'account-B', sessionKey: 'session' },
  ])('does not overwrite malformed row %#', async raw => {
    const key = `${prefix}generation:${A.generation}`;
    await putRaw(key, raw);
    const store = createAuthGenerationStore();
    expect(await store.setItem(A, 'session', 'replacement')).toEqual({ status: 'failed', reason: 'schema-invalid' });
    expect(await store.cancelCandidate(A)).toEqual({ status: 'failed', reason: 'schema-invalid' });
    await expect(store.getItem(A, 'session')).rejects.toMatchObject({ reason: 'schema-invalid' });
    await expect(store.readRecovery()).rejects.toMatchObject({ reason: 'schema-invalid' });
    expect(await createIndexedDbStore().getItem(key)).toEqual(raw);
  });
  it('rejects unknown pointer schema without replacing its original value', async () => {
    const store = await activeA();
    const raw = { version: 99, generation: A.generation, owner: 'account-A' };
    await putRaw(`${prefix}active`, raw); await store.createCandidate(B);
    await expect(store.readActive()).rejects.toMatchObject({ reason: 'schema-invalid' });
    expect(await store.publish({ lease: B, owner: 'account-B', expectedActive: A.generation })).toEqual({ status: 'failed', reason: 'schema-invalid' });
    expect(await store.revoke({ ...A, owner: 'account-A' })).toEqual({ status: 'failed', reason: 'schema-invalid' });
    expect(await createIndexedDbStore().getItem(`${prefix}active`)).toEqual(raw);
  });
});

describe('atomic session owner claim', () => {
  it('binds an unpublished candidate to its actual session owner and rejects wrong-owner publication', async () => {
    const store = createAuthGenerationStore(); await store.createCandidate(A);
    expect(await store.setSessionItem(A, 'session', 'A-session', 'account-A')).toEqual({ status: 'applied' });
    expect(await store.publish({ lease: A, owner: 'account-B', expectedActive: null })).toMatchObject({ reason: 'owner-mismatch' });
    expect(await store.readActive()).toBeNull(); expect(await store.getItem(A, 'session')).toBe('A-session');
    expect(await store.publish({ lease: A, owner: 'account-A', expectedActive: null })).toEqual({ status: 'applied' });
    expect(await store.setSessionItem(A, 'session', 'B-session', 'account-B')).toMatchObject({ reason: 'owner-mismatch' });
    expect(await store.getItem(A, 'session')).toBe('A-session');
  });

  it('refuses generic overwrite or owner replacement after removing claimed session bytes', async () => {
    const store = createAuthGenerationStore(); await store.createCandidate(A);
    await store.setSessionItem(A, 'session', 'A-session', 'account-A');
    expect(await store.setItem(A, 'session', 'generic-bypass')).toMatchObject({ reason: 'session-owner-required' });
    expect(await store.setSessionItem(A, 'other-session', 'alias-bypass', 'account-A')).toMatchObject({ reason: 'session-owner-required' });
    await store.removeItem(A, 'session');
    expect(await store.setSessionItem(A, 'session', 'B-session', 'account-B')).toMatchObject({ reason: 'owner-mismatch' });
    expect(await store.setSessionItem(A, 'session', 'A-refresh', 'account-A')).toEqual({ status: 'applied' });
  });

  it('cannot race a candidate session writer into a different-owner publication', async () => {
    const store = createAuthGenerationStore(); const other = createAuthGenerationStore(); await store.createCandidate(A);
    const [write, publish] = await Promise.all([
      store.setSessionItem(A, 'session', 'A-session', 'account-A'),
      other.publish({ lease: A, owner: 'account-B', expectedActive: null })
    ]);
    expect([write, publish].filter(result => result.status === 'applied')).toHaveLength(1);
    expect([write, publish].filter(result => result.status === 'superseded')).toEqual([{ status: 'superseded', reason: 'owner-mismatch' }]);
    const active = await store.readActive();
    expect(active?.owner === 'account-B' ? await store.getItem(A, 'session') === null : await store.getItem(A, 'session') === 'A-session').toBe(true);
  });

  it('accepts an old version-1 row without claims but respects its bound owner on first session write', async () => {
    const store = await activeA();
    expect(await store.setSessionItem(A, 'session', 'wrong', 'account-B')).toMatchObject({ reason: 'owner-mismatch' });
    expect(await store.getItem(A, 'session')).toBe('original-A');
    expect(await store.setSessionItem(A, 'session', 'A-refresh', 'account-A')).toEqual({ status: 'applied' });
    expect(await store.setItem(A, 'session', 'generic')).toMatchObject({ reason: 'session-owner-required' });
  });

  it('imported session binds a claim and rejects a candidate already claimed by another owner', async () => {
    const raw = createIndexedDbStore(); await raw.setItem('legacy-session', 'original-legacy');
    const store = createAuthGenerationStore(); await store.createCandidate(A);
    await store.setSessionItem(A, 'session', 'A-session', 'account-A');
    expect(await store.importLegacy({ lease: A, owner: 'account-B', expectedActive: null, legacyKey: 'legacy-session', expectedRaw: 'original-legacy', destinationKey: 'session' })).toMatchObject({ reason: 'owner-mismatch' });
    expect(await store.importLegacy({ lease: A, owner: 'account-A', expectedActive: null, legacyKey: 'legacy-session', expectedRaw: 'original-legacy', destinationKey: 'session' })).toEqual({ status: 'applied' });
    expect(await store.setItem(A, 'session', 'generic')).toMatchObject({ reason: 'session-owner-required' });
    expect(await raw.getItem('legacy-session')).toBe('original-legacy');
  });
});

// A failed first claim may be retried, but must not leave a hidden owner binding.
it('aborted first session write preserves the unclaimed candidate', async () => {
  const store = createAuthGenerationStore(); await store.createCandidate(A);
  const original = IDBObjectStore.prototype.put;
  const fault = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function(this: IDBObjectStore, value, key) {
    const request = original.call(this, value, key); this.transaction.abort(); return request;
  });
  expect(await store.setSessionItem(A, 'session', 'A-session', 'account-A')).toEqual({ status: 'failed', reason: 'transaction-failed' });
  fault.mockRestore();
  expect(await store.getItem(A, 'session')).toBeNull();
  expect(await store.setSessionItem(A, 'session', 'B-session', 'account-B')).toEqual({ status: 'applied' });
});

it('reads only validated legacy migration names without modifying malformed claims', async () => {
  const store = createAuthGenerationStore();
  expect(await store.readLegacyImport('missing')).toBeNull();
  const key = 'xai.auth-generation.v1:xai-web-auth:legacy:broken';
  const { createIndexedDbTransactionStore } = await import('./storage');
  const broken = { version: 99, owner: 'A', generation: 'old', legacyKey: 'broken' };
  await createIndexedDbTransactionStore()('readwrite', objectStore => new Promise<void>((resolve, reject) => {
    objectStore.transaction.oncomplete = () => resolve(); objectStore.transaction.onabort = () => reject(Error('fixture abort'));
    objectStore.put(broken, key);
  }));
  await expect(store.readLegacyImport('broken')).rejects.toMatchObject({ reason: 'schema-invalid' });
  expect(await createIndexedDbStore().getItem(key)).toEqual(broken);
});

it('atomically publishes and revokes predecessor without changing ordinary publish semantics', async () => {
  const store = await activeA(); await store.createCandidate(B); await store.setSessionItem(B, 'session', 'B-bytes', 'account-B');
  expect(await store.publishAndRevokePredecessor({ lease: B, owner: 'account-B', expectedActive: A.generation })).toEqual({ status: 'applied' });
  expect(await store.readActive()).toEqual({ ...B, owner: 'account-B' });
  expect(await store.getItem(B, 'session')).toBe('B-bytes');
  expect(await store.readRecovery()).toEqual([{ ...A, owner: 'account-A', state: 'revoked' }]);
  expect(await store.setItem(A, 'session', 'late')).toMatchObject({ reason: 'lease-revoked' });
});

it('aborted predecessor revocation rolls back both generations and active pointer', async () => {
  const store = await activeA(); await store.createCandidate(B); await store.setSessionItem(B, 'session', 'B-candidate', 'account-B');
  const original = IDBObjectStore.prototype.put;
  const fault = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function(this: IDBObjectStore, value, key) {
    const request = original.call(this, value, key);
    if (value?.generation === A.generation && value?.state === 'revoked') this.transaction.abort();
    return request;
  });
  expect(await store.publishAndRevokePredecessor({ lease: B, owner: 'account-B', expectedActive: A.generation })).toEqual({ status: 'failed', reason: 'transaction-failed' });
  fault.mockRestore();
  expect(await store.readActive()).toEqual({ ...A, owner: 'account-A' });
  expect(await store.getItem(A, 'session')).toBe('original-A'); expect(await store.getItem(B, 'session')).toBe('B-candidate');
  expect(await store.readRecovery()).toEqual([]);
  expect(await store.cancelCandidate(B)).toEqual({ status: 'applied' });
});
