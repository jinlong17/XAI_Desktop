import type {
  AddToDesktopRequest,
  PluginInstance,
  PluginInstanceConfig,
  PluginInstanceConfigInput,
  PluginInstanceId,
  PluginInstanceLifecycleState,
} from '../types/plugin';
import { createPluginInstance, createPluginInstanceConfig } from './plugin-center';

export const PLUGIN_INSTANCE_STORE_SCHEMA_VERSION = 1;
export const PLUGIN_INSTANCE_STORE_KEY = 'xai_plugin_instances_v1';

export interface PluginInstanceStoreSnapshot {
  schemaVersion: typeof PLUGIN_INSTANCE_STORE_SCHEMA_VERSION;
  instances: PluginInstance[];
  updatedAt: string;
}

export interface PluginInstancePersistenceAdapter {
  read(): Promise<unknown | null>;
  write(snapshot: PluginInstanceStoreSnapshot): Promise<void>;
}

export interface PluginInstanceStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface CreatePluginInstanceStoreOptions {
  adapter: PluginInstancePersistenceAdapter;
  now?: () => string;
  idFactory?: () => PluginInstanceId;
}

export interface PluginInstanceStore {
  load(): Promise<PluginInstance[]>;
  list(): PluginInstance[];
  get(id: PluginInstanceId): PluginInstance | undefined;
  create(request: AddToDesktopRequest): Promise<PluginInstance>;
  updateConfig(
    id: PluginInstanceId,
    config: PluginInstanceConfigInput,
  ): Promise<PluginInstance>;
  setLifecycleState(
    id: PluginInstanceId,
    lifecycleState: PluginInstanceLifecycleState,
  ): Promise<PluginInstance>;
  enable(id: PluginInstanceId): Promise<PluginInstance>;
  disable(id: PluginInstanceId): Promise<PluginInstance>;
  hide(id: PluginInstanceId): Promise<PluginInstance>;
  deleteInstance(id: PluginInstanceId): Promise<void>;
  exportSnapshot(): PluginInstanceStoreSnapshot;
}

export function createWebStoragePluginInstanceAdapter(
  storage: PluginInstanceStorageLike,
  key = PLUGIN_INSTANCE_STORE_KEY,
): PluginInstancePersistenceAdapter {
  return {
    async read() {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    },
    async write(snapshot) {
      storage.setItem(key, JSON.stringify(snapshot));
    },
  };
}

export function createPluginInstanceStore(
  options: CreatePluginInstanceStoreOptions,
): PluginInstanceStore {
  const now = options.now ?? (() => new Date().toISOString());
  const idFactory = options.idFactory ?? createDefaultInstanceId;
  let snapshot = emptySnapshot(now());
  let loaded = false;

  async function ensureLoaded(): Promise<void> {
    if (!loaded) {
      await load();
    }
  }

  async function load(): Promise<PluginInstance[]> {
    const migrated = migratePluginInstanceStoreSnapshot(await options.adapter.read(), now());
    snapshot = migrated.snapshot;
    loaded = true;
    if (migrated.changed) {
      await options.adapter.write(snapshot);
    }
    return list();
  }

  function list(): PluginInstance[] {
    return snapshot.instances.map(clonePluginInstance);
  }

  function get(id: PluginInstanceId): PluginInstance | undefined {
    const instance = snapshot.instances.find((candidate) => candidate.id === id);
    return instance ? clonePluginInstance(instance) : undefined;
  }

  async function create(request: AddToDesktopRequest): Promise<PluginInstance> {
    await ensureLoaded();
    const timestamp = now();
    const instance = createPluginInstance(request, {
      id: idFactory(),
      now: timestamp,
    });
    await commit([...snapshot.instances, instance], timestamp);
    return clonePluginInstance(instance);
  }

  async function updateConfig(
    id: PluginInstanceId,
    config: PluginInstanceConfigInput,
  ): Promise<PluginInstance> {
    await ensureLoaded();
    return updateInstance(id, now(), (instance, timestamp) => ({
      ...instance,
      config: mergePluginInstanceConfig(instance.config, config),
      updatedAt: timestamp,
    }));
  }

  async function setLifecycleState(
    id: PluginInstanceId,
    lifecycleState: PluginInstanceLifecycleState,
  ): Promise<PluginInstance> {
    await ensureLoaded();
    return updateInstance(id, now(), (instance, timestamp) => ({
      ...instance,
      lifecycleState,
      updatedAt: timestamp,
    }));
  }

  async function deleteInstance(id: PluginInstanceId): Promise<void> {
    await ensureLoaded();
    const timestamp = now();
    const nextInstances = snapshot.instances.filter((instance) => instance.id !== id);
    if (nextInstances.length === snapshot.instances.length) {
      throw new Error(`Plugin instance ${id} does not exist`);
    }
    await commit(nextInstances, timestamp);
  }

  function exportSnapshot(): PluginInstanceStoreSnapshot {
    return {
      ...snapshot,
      instances: list(),
    };
  }

  async function commit(instances: PluginInstance[], timestamp: string): Promise<void> {
    snapshot = {
      schemaVersion: PLUGIN_INSTANCE_STORE_SCHEMA_VERSION,
      instances: instances.map(clonePluginInstance),
      updatedAt: timestamp,
    };
    await options.adapter.write(snapshot);
  }

  async function updateInstance(
    id: PluginInstanceId,
    timestamp: string,
    updater: (instance: PluginInstance, timestamp: string) => PluginInstance,
  ): Promise<PluginInstance> {
    let updated: PluginInstance | undefined;
    const instances = snapshot.instances.map((instance) => {
      if (instance.id !== id) {
        return instance;
      }
      updated = updater(instance, timestamp);
      return updated;
    });
    if (!updated) {
      throw new Error(`Plugin instance ${id} does not exist`);
    }
    await commit(instances, timestamp);
    return clonePluginInstance(updated);
  }

  return {
    load,
    list,
    get,
    create,
    updateConfig,
    setLifecycleState,
    enable: (id) => setLifecycleState(id, 'enabled'),
    disable: (id) => setLifecycleState(id, 'disabled'),
    hide: (id) => setLifecycleState(id, 'hidden'),
    deleteInstance,
    exportSnapshot,
  };
}

export function migratePluginInstanceStoreSnapshot(
  input: unknown,
  now: string,
): { snapshot: PluginInstanceStoreSnapshot; changed: boolean } {
  if (!input) {
    return {
      snapshot: emptySnapshot(now),
      changed: true,
    };
  }

  if (isPluginInstanceStoreSnapshot(input)) {
    return {
      snapshot: {
        schemaVersion: PLUGIN_INSTANCE_STORE_SCHEMA_VERSION,
        instances: input.instances.map(normalizePluginInstance),
        updatedAt: input.updatedAt,
      },
      changed: false,
    };
  }

  const legacyInstances = Array.isArray(input)
    ? input
    : isLegacyPluginInstanceSnapshot(input)
      ? input.instances
      : [];

  return {
    snapshot: {
      schemaVersion: PLUGIN_INSTANCE_STORE_SCHEMA_VERSION,
      instances: legacyInstances.map(normalizePluginInstance),
      updatedAt: now,
    },
    changed: true,
  };
}

function mergePluginInstanceConfig(
  base: PluginInstanceConfig,
  patch: PluginInstanceConfigInput,
): PluginInstanceConfig {
  return createPluginInstanceConfig({
    placement: {
      ...base.placement,
      ...patch.placement,
    },
    size: {
      ...base.size,
      ...patch.size,
    },
    behavior: {
      ...base.behavior,
      ...patch.behavior,
    },
    style: {
      ...base.style,
      ...patch.style,
    },
    dataSource: patch.dataSource ?? base.dataSource,
  });
}

function normalizePluginInstance(input: unknown): PluginInstance {
  const candidate = input as Partial<PluginInstance>;
  return {
    id: String(candidate.id ?? createDefaultInstanceId()),
    pluginName: String(candidate.pluginName ?? 'unknown'),
    contentType: String(candidate.contentType ?? 'unknown'),
    schemaVersion: PLUGIN_INSTANCE_STORE_SCHEMA_VERSION,
    lifecycleState: normalizeLifecycleState(candidate.lifecycleState),
    syncScope: 'device-local',
    config: createPluginInstanceConfig(candidate.config),
    createdAt: String(candidate.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(candidate.updatedAt ?? candidate.createdAt ?? new Date(0).toISOString()),
  };
}

function normalizeLifecycleState(
  lifecycleState: PluginInstance['lifecycleState'] | undefined,
): PluginInstanceLifecycleState {
  return lifecycleState === 'disabled' ||
    lifecycleState === 'hidden' ||
    lifecycleState === 'destroyed'
    ? lifecycleState
    : 'enabled';
}

function isPluginInstanceStoreSnapshot(input: unknown): input is PluginInstanceStoreSnapshot {
  const candidate = input as Partial<PluginInstanceStoreSnapshot>;
  return candidate.schemaVersion === PLUGIN_INSTANCE_STORE_SCHEMA_VERSION &&
    Array.isArray(candidate.instances) &&
    typeof candidate.updatedAt === 'string';
}

function isLegacyPluginInstanceSnapshot(input: unknown): input is { instances: unknown[] } {
  const candidate = input as { instances?: unknown };
  return Array.isArray(candidate.instances);
}

function emptySnapshot(updatedAt: string): PluginInstanceStoreSnapshot {
  return {
    schemaVersion: PLUGIN_INSTANCE_STORE_SCHEMA_VERSION,
    instances: [],
    updatedAt,
  };
}

function clonePluginInstance(instance: PluginInstance): PluginInstance {
  return {
    ...instance,
    config: createPluginInstanceConfig(instance.config),
  };
}

function createDefaultInstanceId(): PluginInstanceId {
  return `plugin-instance-${Date.now().toString(36)}`;
}
