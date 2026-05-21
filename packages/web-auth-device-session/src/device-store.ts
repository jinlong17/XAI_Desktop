import { createIndexedDbStore, type KeyValueStore } from "./storage";

const DEVICE_ID_KEY = "device.id";

export interface DeviceIdentityStore {
  get(): Promise<string | null>;
  set(deviceId: string): Promise<void>;
  clear(): Promise<void>;
  ensure(factory?: () => string): Promise<string>;
}

export interface CreateDeviceIdentityStoreOptions {
  store?: KeyValueStore;
  key?: string;
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const random = Math.random().toString(16).slice(2, 14);
  return `device-${Date.now()}-${random}`;
}

export function createDeviceIdentityStore(options: CreateDeviceIdentityStoreOptions = {}): DeviceIdentityStore {
  const store = options.store ?? createIndexedDbStore({ storeName: "device" });
  const key = options.key ?? DEVICE_ID_KEY;

  return {
    get() {
      return store.getItem(key);
    },
    async set(deviceId: string) {
      await store.setItem(key, deviceId);
    },
    async clear() {
      await store.removeItem(key);
    },
    async ensure(factory = createId) {
      const existing = await store.getItem(key);
      if (existing) {
        return existing;
      }

      const next = factory();
      await store.setItem(key, next);
      return next;
    }
  };
}
