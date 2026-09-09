import { del, get, set, type UseStore } from "idb-keyval";
import type { SupportedStorage } from "@supabase/supabase-js";

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface CreateIndexedDbStoreOptions {
  dbName?: string;
  storeName?: string;
}

const DEFAULT_DB_NAME = "xai-web-auth";
const DEFAULT_STORE_NAME = "session";

interface DatabaseState {
  stores: Set<string>;
  connection?: IDBDatabase;
  opening?: Promise<IDBDatabase>;
  operation?: Promise<unknown>;
}

// Separate factories also isolate test environments and embedded browser contexts.
const databases = new WeakMap<IDBFactory, Map<string, DatabaseState>>();

function openDatabase(factory: IDBFactory, name: string, state: DatabaseState, version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(name, version);
    let settled = false;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    request.onblocked = () => fail(new DOMException(
      `Database ${name} upgrade is blocked; close other tabs and retry.`, 'InvalidStateError'
    ));
    request.onerror = () => fail(request.error);
    request.onupgradeneeded = () => {
      // A blocked request cannot be cancelled. Abort its delayed upgrade after rejection.
      if (settled) {
        request.transaction?.abort();
        return;
      }
      for (const store of state.stores) {
        if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      if (settled) {
        db.close();
        return;
      }
      settled = true;
      const invalidate = () => {
        db.close();
        if (state.connection === db) state.connection = undefined;
      };
      db.onversionchange = invalidate;
      db.onclose = invalidate;
      resolve(db);
    };
  });
}

async function getDatabase(factory: IDBFactory, name: string, state: DatabaseState): Promise<IDBDatabase> {
  if (state.opening) await state.opening;
  const minimumVersion = name === DEFAULT_DB_NAME ? 2 : 1;
  const valid = (db: IDBDatabase) => db.version >= minimumVersion
    && [...state.stores].every(store => db.objectStoreNames.contains(store));
  if (state.connection && valid(state.connection)) return state.connection;
  const opening = (async () => {
    let db = state.connection ?? await openDatabase(factory, name, state);
    if (!valid(db)) {
      const nextVersion = Math.max(minimumVersion, db.version + 1);
      db.close();
      state.connection = undefined;
      db = await openDatabase(factory, name, state, nextVersion);
    }
    state.connection = db;
    return db;
  })();
  state.opening = opening;
  try {
    return await opening;
  } finally {
    if (state.opening === opening) state.opening = undefined;
  }
}

function createUseStore(options: CreateIndexedDbStoreOptions = {}): UseStore {
  const name = options.dbName ?? DEFAULT_DB_NAME;
  const storeName = options.storeName ?? DEFAULT_STORE_NAME;
  return async (mode, callback) => {
    const factory = indexedDB;
    let byName = databases.get(factory);
    if (!byName) databases.set(factory, byName = new Map());
    let state = byName.get(name);
    if (!state) {
      state = { stores: new Set(name === DEFAULT_DB_NAME ? ['session', 'device'] : []) };
      byName.set(name, state);
    }
    state.stores.add(storeName);
    // Keep schema upgrades behind active operations: closing a warm connection
    // between awaiting getDatabase and creating its transaction invalidates it.
    const database = state;
    const run = async () => {
      const db = await getDatabase(factory, name, database);
      return callback(db.transaction(storeName, mode).objectStore(storeName));
    };
    const operation = (database.operation ?? Promise.resolve()).then(run, run);
    database.operation = operation.then(() => undefined, () => undefined);
    return operation;
  };
}

export function createIndexedDbStore(options: CreateIndexedDbStoreOptions = {}): KeyValueStore {
  const store = createUseStore(options);
  return {
    async getItem(key: string) {
      const value = await get<string>(key, store);
      return value ?? null;
    },
    async setItem(key: string, value: string) {
      await set(key, value, store);
    },
    async removeItem(key: string) {
      await del(key, store);
    }
  };
}

export interface CreateAuthSessionStorageOptions {
  store?: KeyValueStore;
  transientStore?: KeyValueStore;
  isTransientKey?: (key: string) => boolean;
}

const PKCE_VERIFIER_KEY_SUFFIX = "-code-verifier";

function isPkceTransientKey(key: string): boolean {
  return key.endsWith(PKCE_VERIFIER_KEY_SUFFIX);
}

function resolveSessionStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function createSessionStorageKeyValueStore(storage: Storage | null = resolveSessionStorage()): KeyValueStore {
  return {
    async getItem(key: string) {
      return storage?.getItem(key) ?? null;
    },
    async setItem(key: string, value: string) {
      storage?.setItem(key, value);
    },
    async removeItem(key: string) {
      storage?.removeItem(key);
    }
  };
}

export function createAuthSessionStorage(options: CreateAuthSessionStorageOptions = {}): SupportedStorage {
  const store = options.store ?? createIndexedDbStore();
  const transientStore = options.transientStore ?? createSessionStorageKeyValueStore();
  const isTransientKey = options.isTransientKey ?? isPkceTransientKey;

  return {
    getItem: (key) => (isTransientKey(key) ? transientStore.getItem(key) : store.getItem(key)),
    setItem: (key, value) => (isTransientKey(key) ? transientStore.setItem(key, value) : store.setItem(key, value)),
    removeItem: (key) => (isTransientKey(key) ? transientStore.removeItem(key) : store.removeItem(key))
  };
}

export function createMemoryKeyValueStore(): KeyValueStore {
  const cache = new Map<string, string>();

  return {
    async getItem(key: string) {
      return cache.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      cache.set(key, value);
    },
    async removeItem(key: string) {
      cache.delete(key);
    }
  };
}
