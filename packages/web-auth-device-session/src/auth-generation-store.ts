import { createIndexedDbTransactionStore, type CreateIndexedDbStoreOptions } from './storage';

/** Auth login lifetime, independent of account-data generation. Never reuse an ID. */
export interface AuthGenerationLease { readonly generation: string }
export interface ActiveAuthGeneration extends AuthGenerationLease { readonly owner: string }
export type AuthGenerationFailure =
  | 'invalid-input' | 'transaction-failed' | 'schema-invalid' | 'generation-exists' | 'lease-revoked'
  | 'session-owner-required' | 'lease-missing' | 'active-changed' | 'owner-mismatch' | 'not-candidate' | 'legacy-changed' | 'legacy-already-imported';
export type AuthGenerationMutationResult =
  | { status: 'applied' }
  | { status: 'superseded'; reason: AuthGenerationFailure }
  | { status: 'failed'; reason: AuthGenerationFailure };
export interface AuthGenerationRecovery extends AuthGenerationLease {
  owner: string | null;
  /** Durable revocation; transient/remote cleanup is the coordinator's responsibility. */
  state: 'revoked';
}
export interface CreateAuthGenerationStoreOptions extends CreateIndexedDbStoreOptions {
  /** SDK base storage key. Each namespace has an independent active pointer. */
  storageKey?: string;
}
export interface PublishAuthGenerationOptions {
  lease: AuthGenerationLease;
  owner: string;
  expectedActive: string | null;
}
export interface ImportLegacyAuthGenerationOptions extends PublishAuthGenerationOptions {
  legacyKey: string;
  expectedRaw: string;
  /** Logical SDK session key in the candidate facade. */
  destinationKey: string;
}
export interface AuthGenerationStore {
  createCandidate(lease: AuthGenerationLease): Promise<AuthGenerationMutationResult>;
  readActive(): Promise<ActiveAuthGeneration | null>;
  publish(options: PublishAuthGenerationOptions): Promise<AuthGenerationMutationResult>;
  revoke(captured: ActiveAuthGeneration): Promise<AuthGenerationMutationResult>;
  cancelCandidate(lease: AuthGenerationLease): Promise<AuthGenerationMutationResult>;
  getItem(lease: AuthGenerationLease, key: string): Promise<string | null>;
  setItem(lease: AuthGenerationLease, key: string, value: string): Promise<AuthGenerationMutationResult>;
  /** Owner must be derived from the actual SDK session, not current UI identity. */
  setSessionItem(lease: AuthGenerationLease, key: string, value: string, owner: string): Promise<AuthGenerationMutationResult>;
  removeItem(lease: AuthGenerationLease, key: string): Promise<AuthGenerationMutationResult>;
  readRecovery(): Promise<AuthGenerationRecovery[]>;
  /** Atomically compares legacy bytes, copies and publishes; never deletes the legacy row. */
  importLegacy(options: ImportLegacyAuthGenerationOptions): Promise<AuthGenerationMutationResult>;
}
export class AuthGenerationStorageError extends Error {
  readonly reason: 'invalid-input' | 'transaction-failed' | 'schema-invalid';
  constructor(reason: 'invalid-input' | 'transaction-failed' | 'schema-invalid') {
    super(`auth_generation_${reason}`);
    this.name = 'AuthGenerationStorageError';
    this.reason = reason;
  }
}
interface GenerationRow {
  version: 1;
  generation: string;
  owner: string | null;
  state: 'candidate' | 'active' | 'revoked';
  entries: [string, string][];
  /** Optional for compatibility with the original version-1 foundation rows. */
  sessionOwner?: string;
  sessionKey?: string;
}
const applied: AuthGenerationMutationResult = { status: 'applied' };
const superseded = (reason: AuthGenerationFailure): AuthGenerationMutationResult => ({ status: 'superseded', reason });
const validName = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 512;
const validLease = (lease: AuthGenerationLease): boolean => !!lease && validName(lease.generation);

/**
 * Dormant foundation: callers must bind SDK clients, transient PKCE and bootstrap
 * to these generations. This does not intercept existing unscoped auth storage.
 */
export function createAuthGenerationStore(options: CreateAuthGenerationStoreOptions = {}): AuthGenerationStore {
  const namespace = options.storageKey ?? 'xai-web-auth';
  if (!validName(namespace)) throw new AuthGenerationStorageError('invalid-input');
  const prefix = `xai.auth-generation.v1:${encodeURIComponent(namespace)}:`;
  const pointerKey = `${prefix}active`;
  const rowPrefix = `${prefix}generation:`;
  const rowKey = (generation: string) => `${rowPrefix}${encodeURIComponent(generation)}`;
  const useStore = createIndexedDbTransactionStore(options);
  const invalidSchemas = new WeakSet<IDBTransaction>();
  function rejectSchema(store: IDBObjectStore): void {
    invalidSchemas.add(store.transaction);
    store.transaction.abort();
  }
  function validRow(value: unknown, expectedGeneration?: string): value is GenerationRow {
    if (!value || typeof value !== 'object') return false;
    const row = value as GenerationRow;
    if (row.version !== 1 || !validName(row.generation) || (expectedGeneration !== undefined && row.generation !== expectedGeneration)) return false;
    if (!['candidate', 'active', 'revoked'].includes(row.state)) return false;
    if (row.owner !== null && !validName(row.owner)) return false;
    if ((row.sessionOwner === undefined) !== (row.sessionKey === undefined)) return false;
    if (row.sessionOwner !== undefined && (!validName(row.sessionOwner) || !validName(row.sessionKey) || (row.owner !== null && row.owner !== row.sessionOwner))) return false;
    if ((row.state === 'candidate' && row.owner !== null) || (row.state === 'active' && row.owner === null)) return false;
    if (!Array.isArray(row.entries) || !row.entries.every(entry => Array.isArray(entry) && entry.length === 2 && validName(entry[0]) && typeof entry[1] === 'string')) return false;
    return new Set(row.entries.map(([key]) => key)).size === row.entries.length && (row.state !== 'revoked' || row.entries.length === 0);
  }

  // All request scheduling stays inside IDB callbacks. No external async work may
  // occur between the ownership check and its write/delete in this transaction.
  function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, finish: (value: T) => void) => void): Promise<T> {
    return useStore(mode, store => new Promise<T>((resolve, reject) => {
      let result: T;
      let finished = false;
      const tx = store.transaction;
      tx.oncomplete = () => finished ? resolve(result) : reject(new AuthGenerationStorageError('transaction-failed'));
      tx.onabort = tx.onerror = () => reject(new AuthGenerationStorageError(invalidSchemas.has(tx) ? 'schema-invalid' : 'transaction-failed'));
      try { run(store, value => { result = value; finished = true; }); }
      catch { tx.abort(); }
    })).catch(error => { throw error instanceof AuthGenerationStorageError ? error : new AuthGenerationStorageError('transaction-failed'); });
  }
  async function mutate(run: (store: IDBObjectStore, finish: (value: AuthGenerationMutationResult) => void) => void): Promise<AuthGenerationMutationResult> {
    try { return await transaction('readwrite', run); }
    catch (error) { return { status: 'failed', reason: error instanceof AuthGenerationStorageError ? error.reason : 'transaction-failed' }; }
  }
  const invalid = (): Promise<AuthGenerationMutationResult> => Promise.resolve({ status: 'failed', reason: 'invalid-input' });
  function readRow(store: IDBObjectStore, lease: AuthGenerationLease, next: (row: GenerationRow | undefined) => void) {
    const request = store.get(rowKey(lease.generation));
    request.onsuccess = () => {
      if (request.result !== undefined && !validRow(request.result, lease.generation)) return rejectSchema(store);
      next(request.result as GenerationRow | undefined);
    };
  }
  function readPointer(store: IDBObjectStore, next: (pointer: ActiveAuthGeneration | null) => void) {
    const request = store.get(pointerKey);
    request.onsuccess = () => {
      const value = request.result;
      if (value === undefined) return next(null);
      if (!value || typeof value !== 'object' || value.version !== 1 || !validName(value.generation) || !validName(value.owner)) return rejectSchema(store);
      next({ generation: value.generation, owner: value.owner });
    };
  }
  function checkLease(store: IDBObjectStore, row: GenerationRow | undefined, next: (reason: AuthGenerationFailure | null) => void) {
    if (!row) return next('lease-missing');
    if (row.state === 'revoked') return next('lease-revoked');
    if (row.state === 'candidate') return next(null);
    readPointer(store, pointer => next(pointer?.generation === row.generation && pointer.owner === row.owner ? null : 'active-changed'));
  }
  function publishInside(store: IDBObjectStore, input: PublishAuthGenerationOptions, finish: (result: AuthGenerationMutationResult) => void, imported?: ImportLegacyAuthGenerationOptions) {
    readRow(store, input.lease, row => {
      if (!row) return finish(superseded('lease-missing'));
      if (row.state === 'revoked') return finish(superseded('lease-revoked'));
      if ((row.owner !== null && row.owner !== input.owner) || (row.sessionOwner !== undefined && row.sessionOwner !== input.owner)) return finish(superseded('owner-mismatch'));
      if (imported && row.sessionKey !== undefined && row.sessionKey !== imported.destinationKey) return finish(superseded('session-owner-required'));
      // Published generations cannot be resurrected or rebound after replacement.
      if (row.state !== 'candidate') return finish(superseded('not-candidate'));
      readPointer(store, pointer => {
        if ((pointer?.generation ?? null) !== input.expectedActive) return finish(superseded('active-changed'));
        const commit = () => {
          row.owner = input.owner;
          row.state = 'active';
          store.put(row, rowKey(row.generation));
          store.put({ version: 1, generation: row.generation, owner: row.owner }, pointerKey);
          finish(applied);
        };
        if (!imported) return commit();
        const claimKey = `${prefix}legacy:${encodeURIComponent(imported.legacyKey)}`;
        const claim = store.get(claimKey);
        claim.onsuccess = () => {
          if (claim.result !== undefined) {
            const value = claim.result;
            if (!value || typeof value !== 'object' || value.version !== 1 || !validName(value.generation) || !validName(value.owner) || value.legacyKey !== imported.legacyKey) return rejectSchema(store);
            return finish(superseded('legacy-already-imported'));
          }
          const request = store.get(imported.legacyKey);
          request.onsuccess = () => {
            if (request.result !== imported.expectedRaw) return finish(superseded('legacy-changed'));
            row.sessionOwner = input.owner;
            row.sessionKey = imported.destinationKey;
            row.entries = row.entries.filter(([key]) => key !== imported.destinationKey);
            row.entries.push([imported.destinationKey, imported.expectedRaw]);
            // Retaining old bytes must not allow a later bootstrap to reimport
            // a logged-out generation. Claim survives revocation; contains no token.
            store.put({ version: 1, generation: row.generation, owner: input.owner, legacyKey: imported.legacyKey }, claimKey);
            commit();
          };
        };
      });
    });
  }
  function validPublish(input: PublishAuthGenerationOptions): boolean {
    return !!input && validLease(input.lease) && validName(input.owner)
      && (input.expectedActive === null || validName(input.expectedActive));
  }
  return {
    createCandidate(lease) {
      if (!validLease(lease)) return invalid();
      lease = { generation: lease.generation };
      return mutate((store, finish) => readRow(store, lease, row => {
        if (row !== undefined) return finish(superseded('generation-exists'));
        store.add({ version: 1, generation: lease.generation, owner: null, state: 'candidate', entries: [] } satisfies GenerationRow, rowKey(lease.generation));
        finish(applied);
      }));
    },
    readActive() {
      return transaction('readonly', (store, finish) => readPointer(store, pointer => {
        if (!pointer) return finish(null);
        readRow(store, pointer, row => {
          if (!row || row.state !== 'active' || row.owner !== pointer.owner) {
            rejectSchema(store);
            return;
          }
          finish(pointer);
        });
      }));
    },
    publish(input) {
      if (!validPublish(input)) return invalid();
      input = { ...input, lease: { generation: input.lease.generation } };
      return mutate((store, finish) => publishInside(store, input, finish));
    },
    revoke(captured) {
      if (!validLease(captured) || !validName(captured.owner)) return invalid();
      captured = { generation: captured.generation, owner: captured.owner };
      return mutate((store, finish) => readRow(store, captured, row => {
        if (!row) return finish(superseded('lease-missing'));
        if (row.owner !== captured.owner) return finish(superseded('owner-mismatch'));
        row.state = 'revoked';
        row.entries = [];
        store.put(row, rowKey(row.generation));
        readPointer(store, pointer => {
          if (pointer?.generation === captured.generation && pointer.owner === captured.owner) store.delete(pointerKey);
          finish(applied);
        });
      }));
    },
    cancelCandidate(lease) {
      if (!validLease(lease)) return invalid();
      lease = { generation: lease.generation };
      return mutate((store, finish) => readRow(store, lease, row => {
        if (!row) return finish(superseded('lease-missing'));
        if (row.state !== 'candidate' || row.owner !== null) return finish(superseded('not-candidate'));
        row.state = 'revoked';
        row.entries = [];
        store.put(row, rowKey(row.generation));
        finish(applied);
      }));
    },
    getItem(lease, key) {
      if (!validLease(lease) || !validName(key)) return Promise.reject(new AuthGenerationStorageError('invalid-input'));
      lease = { generation: lease.generation };
      return transaction('readonly', (store, finish) => readRow(store, lease, row => checkLease(store, row, reason => {
        finish(reason ? null : row!.entries.find(([entryKey]) => entryKey === key)?.[1] ?? null);
      })));
    },
    setItem(lease, key, value) {
      if (!validLease(lease) || !validName(key) || typeof value !== 'string') return invalid();
      lease = { generation: lease.generation };
      return mutate((store, finish) => readRow(store, lease, row => checkLease(store, row, reason => {
        if (reason) return finish(superseded(reason));
        if (row!.sessionKey === key) return finish(superseded('session-owner-required'));
        row!.entries = row!.entries.filter(([entryKey]) => entryKey !== key);
        row!.entries.push([key, value]);
        store.put(row, rowKey(lease.generation));
        finish(applied);
      })));
    },
    setSessionItem(lease, key, value, owner) {
      if (!validLease(lease) || !validName(key) || typeof value !== 'string' || !validName(owner)) return invalid();
      lease = { generation: lease.generation };
      return mutate((store, finish) => readRow(store, lease, row => checkLease(store, row, reason => {
        if (reason) return finish(superseded(reason));
        if ((row!.owner !== null && row!.owner !== owner) || (row!.sessionOwner !== undefined && row!.sessionOwner !== owner)) return finish(superseded('owner-mismatch'));
        if (row!.sessionKey !== undefined && row!.sessionKey !== key) return finish(superseded('session-owner-required'));
        row!.sessionOwner = owner;
        row!.sessionKey = key;
        row!.entries = row!.entries.filter(([entryKey]) => entryKey !== key);
        row!.entries.push([key, value]);
        store.put(row, rowKey(lease.generation));
        finish(applied);
      })));
    },
    removeItem(lease, key) {
      if (!validLease(lease) || !validName(key)) return invalid();
      lease = { generation: lease.generation };
      return mutate((store, finish) => readRow(store, lease, row => checkLease(store, row, reason => {
        if (reason) return finish(superseded(reason));
        row!.entries = row!.entries.filter(([entryKey]) => entryKey !== key);
        store.put(row, rowKey(lease.generation));
        finish(applied);
      })));
    },
    readRecovery() {
      return transaction('readonly', (store, finish) => {
        const results: AuthGenerationRecovery[] = [];
        const request = store.openCursor(IDBKeyRange.bound(rowPrefix, `${rowPrefix}\uffff`));
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return finish(results);
          const row = cursor.value;
          if (!validRow(row) || cursor.key !== rowKey(row.generation)) return rejectSchema(store);
          if (row.state === 'revoked') results.push({ generation: row.generation, owner: row.owner, state: 'revoked' });
          cursor.continue();
        };
      });
    },
    importLegacy(input) {
      if (!validPublish(input) || !validName(input.legacyKey) || input.legacyKey.startsWith(prefix)
        || !validName(input.destinationKey) || typeof input.expectedRaw !== 'string') return invalid();
      input = { ...input, lease: { generation: input.lease.generation } };
      return mutate((store, finish) => publishInside(store, input, finish, input));
    }
  };
}
