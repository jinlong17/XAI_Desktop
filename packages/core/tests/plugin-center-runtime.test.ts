import { describe, expect, it, vi } from 'vitest';
import {
  addPluginCenterEntryToDesktop,
  createPluginCenterEntry,
  createPluginInstanceStore,
} from '../src/registry';
import type { PluginWindowAdapter } from '../src/registry';
import type { PluginManifest, PluginRegistration } from '../src/types/plugin';

function createManifest(overrides: Partial<PluginManifest> = {}): PluginManifest {
  return {
    name: 'organizer',
    version: '1.0.0',
    displayName: '智能桌面整理',
    description: 'Desktop organizer',
    author: 'Test',
    enabled: true,
    contentTypes: ['normal-window-organizer'],
    windows: {},
    events: { emit: [], listen: [] },
    dependencies: [],
    tauriCommands: [],
    ...overrides,
  };
}

function createRegistration(overrides: Partial<PluginManifest> = {}): PluginRegistration {
  return {
    manifest: createManifest(overrides),
    components: {},
  };
}

describe('plugin center add-to-desktop runtime', () => {
  it('creates a device-local instance and opens a plugin window', async () => {
    const writes: unknown[] = [];
    const store = createPluginInstanceStore({
      adapter: {
        async read() {
          return null;
        },
        async write(snapshot) {
          writes.push(snapshot);
        },
      },
      idFactory: () => 'organizer-instance-1',
      now: () => '2026-06-06T12:00:00.000Z',
    });
    const create = vi.fn(async ({ instanceId, config }) => ({
      instanceId,
      label: `grid_${instanceId}`,
      surface: 'grid' as const,
      rect: {
        x: config.placement.x,
        y: config.placement.y,
        width: config.size.width,
        height: config.size.height,
      },
      visible: true,
      placement: config.placement,
      size: config.size,
      behavior: config.behavior,
      style: config.style,
      nativeApplied: {
        placement: true,
        size: true,
        opacity: false,
        clickThrough: false,
        pinned: false,
        allSpaces: false,
      },
    }));
    const windowAdapter = {
      create,
      update: vi.fn(),
      focus: vi.fn(),
      close: vi.fn(),
      list: vi.fn(),
    } satisfies PluginWindowAdapter;

    const entry = createPluginCenterEntry(createRegistration());
    const result = await addPluginCenterEntryToDesktop(entry, {
      store,
      windowAdapter,
      config: {
        placement: { x: 144, y: 96 },
        size: { width: 360, height: 280 },
      },
    });

    expect(result.instance).toMatchObject({
      id: 'organizer-instance-1',
      pluginName: 'organizer',
      contentType: 'normal-window-organizer',
      lifecycleState: 'enabled',
      syncScope: 'device-local',
    });
    expect(result.window).toMatchObject({
      instanceId: 'organizer-instance-1',
      label: 'grid_organizer-instance-1',
      rect: { x: 144, y: 96, width: 360, height: 280 },
    });
    expect(create).toHaveBeenCalledWith({
      instanceId: 'organizer-instance-1',
      config: result.instance.config,
    });
    expect(writes).toHaveLength(2);
  });

  it('rejects locked Plugin Center entries before writing an instance', async () => {
    const store = createPluginInstanceStore({
      adapter: {
        async read() {
          return null;
        },
        async write() {
          throw new Error('store should not write');
        },
      },
    });
    const windowAdapter = {
      create: vi.fn(),
      update: vi.fn(),
      focus: vi.fn(),
      close: vi.fn(),
      list: vi.fn(),
    } satisfies PluginWindowAdapter;
    const plannedEntry = createPluginCenterEntry(createRegistration(), {
      status: 'planned',
    });

    await expect(
      addPluginCenterEntryToDesktop(plannedEntry, {
        store,
        windowAdapter,
      }),
    ).rejects.toThrow('Plugin organizer is not addable from Plugin Center');
    expect(windowAdapter.create).not.toHaveBeenCalled();
  });
});
