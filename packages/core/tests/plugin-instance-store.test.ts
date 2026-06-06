import { describe, expect, it } from 'vitest';
import {
  createAddToDesktopRequest,
  createPluginCenterEntry,
  createPluginInstanceStore,
  createWebStoragePluginInstanceAdapter,
  migratePluginInstanceStoreSnapshot,
  PLUGIN_INSTANCE_STORE_KEY,
  PLUGIN_INSTANCE_STORE_SCHEMA_VERSION,
} from '../src/registry';
import type {
  PluginInstancePersistenceAdapter,
  PluginInstanceStoreSnapshot,
  PluginInstanceStorageLike,
} from '../src/registry';
import type { AddToDesktopRequest, PluginManifest, PluginRegistration } from '../src/types/plugin';

function createManifest(overrides: Partial<PluginManifest> = {}): PluginManifest {
  return {
    name: 'widgets',
    version: '0.1.0',
    displayName: 'Desktop Widgets',
    description: 'Built-in time widgets',
    author: 'Test',
    enabled: true,
    contentTypes: ['widget'],
    windows: { overlay: true },
    events: { emit: [], listen: [] },
    dependencies: [],
    tauriCommands: [],
    ...overrides,
  };
}

function createRequest(): AddToDesktopRequest {
  const registration: PluginRegistration = {
    manifest: createManifest(),
    components: {},
  };
  return createAddToDesktopRequest(createPluginCenterEntry(registration), {
    config: {
      placement: { x: 120, y: 160 },
      style: { opacity: 0.8 },
    },
  });
}

function createMemoryAdapter(initial: unknown = null): PluginInstancePersistenceAdapter & {
  writes: PluginInstanceStoreSnapshot[];
} {
  let value = initial;
  const writes: PluginInstanceStoreSnapshot[] = [];
  return {
    writes,
    async read() {
      return value;
    },
    async write(snapshot) {
      value = snapshot;
      writes.push(snapshot);
    },
  };
}

function createClock(...values: string[]): () => string {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

describe('plugin instance store', () => {
  it('creates and persists a device-local plugin instance', async () => {
    const adapter = createMemoryAdapter();
    const store = createPluginInstanceStore({
      adapter,
      idFactory: () => 'instance-1',
      now: createClock('2026-06-06T10:00:00.000Z', '2026-06-06T10:01:00.000Z'),
    });

    const instance = await store.create(createRequest());

    expect(instance).toMatchObject({
      id: 'instance-1',
      pluginName: 'widgets',
      contentType: 'widget',
      lifecycleState: 'enabled',
      syncScope: 'device-local',
      createdAt: '2026-06-06T10:01:00.000Z',
      updatedAt: '2026-06-06T10:01:00.000Z',
    });
    expect(adapter.writes.at(-1)).toMatchObject({
      schemaVersion: PLUGIN_INSTANCE_STORE_SCHEMA_VERSION,
      updatedAt: '2026-06-06T10:01:00.000Z',
      instances: [expect.objectContaining({ id: 'instance-1' })],
    });
  });

  it('updates config without dropping existing placement, size, behavior, or style fields', async () => {
    const adapter = createMemoryAdapter();
    const store = createPluginInstanceStore({
      adapter,
      idFactory: () => 'instance-1',
      now: createClock(
        '2026-06-06T10:00:00.000Z',
        '2026-06-06T10:01:00.000Z',
        '2026-06-06T10:02:00.000Z',
      ),
    });
    await store.create(createRequest());

    const updated = await store.updateConfig('instance-1', {
      placement: { x: 220 },
      behavior: { pinned: true },
      style: { opacity: 0.55 },
      dataSource: { scope: 'today' },
    });

    expect(updated.config).toEqual({
      placement: { x: 220, y: 160 },
      size: { preset: 'medium', width: 320, height: 240 },
      behavior: {
        pinned: true,
        clickThrough: false,
        allSpaces: false,
        clickAction: 'focus',
      },
      style: {
        mode: 'system',
        opacity: 0.55,
      },
      dataSource: { scope: 'today' },
    });
    expect(updated.updatedAt).toBe('2026-06-06T10:02:00.000Z');
  });

  it('disables and hides instances while preserving config', async () => {
    const adapter = createMemoryAdapter();
    const store = createPluginInstanceStore({
      adapter,
      idFactory: () => 'instance-1',
      now: createClock(
        '2026-06-06T10:00:00.000Z',
        '2026-06-06T10:01:00.000Z',
        '2026-06-06T10:02:00.000Z',
        '2026-06-06T10:03:00.000Z',
      ),
    });
    await store.create(createRequest());
    const disabled = await store.disable('instance-1');
    const hidden = await store.hide('instance-1');

    expect(disabled.lifecycleState).toBe('disabled');
    expect(hidden.lifecycleState).toBe('hidden');
    expect(hidden.config.placement).toEqual({ x: 120, y: 160 });
    expect(store.list()).toHaveLength(1);
  });

  it('deletes an instance and clears it from persisted snapshot', async () => {
    const adapter = createMemoryAdapter();
    const store = createPluginInstanceStore({
      adapter,
      idFactory: () => 'instance-1',
      now: createClock(
        '2026-06-06T10:00:00.000Z',
        '2026-06-06T10:01:00.000Z',
        '2026-06-06T10:02:00.000Z',
      ),
    });
    await store.create(createRequest());

    await store.deleteInstance('instance-1');

    expect(store.list()).toEqual([]);
    expect(adapter.writes.at(-1)?.instances).toEqual([]);
  });

  it('migrates legacy arrays into schema v1 device-local snapshots', async () => {
    const legacy = [
      {
        id: 'legacy-1',
        pluginName: 'widgets',
        contentType: 'widget',
        lifecycleState: 'hidden',
        syncScope: 'account-sync',
        config: { placement: { x: 12, y: 34 } },
        createdAt: '2026-06-01T00:00:00.000Z',
      },
    ];
    const adapter = createMemoryAdapter(legacy);
    const store = createPluginInstanceStore({
      adapter,
      now: () => '2026-06-06T10:00:00.000Z',
    });

    const instances = await store.load();

    expect(instances).toEqual([
      expect.objectContaining({
        id: 'legacy-1',
        schemaVersion: 1,
        lifecycleState: 'hidden',
        syncScope: 'device-local',
        updatedAt: '2026-06-01T00:00:00.000Z',
      }),
    ]);
    expect(adapter.writes.at(-1)).toMatchObject({
      schemaVersion: PLUGIN_INSTANCE_STORE_SCHEMA_VERSION,
      updatedAt: '2026-06-06T10:00:00.000Z',
    });
  });

  it('reads and writes through the Web Storage adapter', async () => {
    const storage = createFakeStorage();
    const adapter = createWebStoragePluginInstanceAdapter(storage);
    const snapshot = migratePluginInstanceStoreSnapshot([], '2026-06-06T10:00:00.000Z').snapshot;

    await adapter.write(snapshot);

    expect(storage.getItem(PLUGIN_INSTANCE_STORE_KEY)).toBe(JSON.stringify(snapshot));
    await expect(adapter.read()).resolves.toEqual(snapshot);
  });
});

function createFakeStorage(): PluginInstanceStorageLike {
  const values = new Map<string, string>();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}
