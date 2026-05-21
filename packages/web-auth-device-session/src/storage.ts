import { createStore, del, get, set, type UseStore } from "idb-keyval";
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

function createUseStore(options: CreateIndexedDbStoreOptions = {}): UseStore {
  return createStore(options.dbName ?? DEFAULT_DB_NAME, options.storeName ?? DEFAULT_STORE_NAME);
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
