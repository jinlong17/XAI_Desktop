import { describe, expect, it, vi } from 'vitest';
import {
  createAddToDesktopRequest,
  createPluginCenterEntry,
  createPluginInstanceStore,
  deletePluginInstanceOnDesktop,
  disablePluginInstanceOnDesktop,
  enablePluginInstanceOnDesktop,
  hidePluginInstanceOnDesktop,
  updatePluginInstanceConfigOnDesktop,
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

function createRuntime() {
  let value: unknown = null;
  const store = createPluginInstanceStore({
    adapter: {
      async read() {
        return value;
      },
      async write(snapshot) {
        value = snapshot;
      },
    },
    idFactory: () => 'instance-1',
    now: () => '2026-06-06T12:00:00.000Z',
  });
  const windowAdapter = {
    create: vi.fn(async ({ instanceId, config }) => ({
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
    })),
    update: vi.fn(async ({ instanceId, config }) => ({
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
    })),
    focus: vi.fn(),
    close: vi.fn(async () => undefined),
    list: vi.fn(),
  } satisfies PluginWindowAdapter;
  return { store, windowAdapter };
}

async function seedInstance(runtime: ReturnType<typeof createRuntime>) {
  const entry = createPluginCenterEntry(createRegistration());
  return runtime.store.create(createAddToDesktopRequest(entry));
}

describe('plugin instance runtime actions', () => {
  it('enables an instance and recreates its window', async () => {
    const runtime = createRuntime();
    await seedInstance(runtime);
    await runtime.store.disable('instance-1');

    const result = await enablePluginInstanceOnDesktop('instance-1', runtime);

    expect(result.instance.lifecycleState).toBe('enabled');
    expect(runtime.windowAdapter.create).toHaveBeenCalledWith({
      instanceId: 'instance-1',
      config: result.instance.config,
    });
  });

  it('disables and hides instances while closing their windows', async () => {
    const runtime = createRuntime();
    await seedInstance(runtime);

    const disabled = await disablePluginInstanceOnDesktop('instance-1', runtime);
    const hidden = await hidePluginInstanceOnDesktop('instance-1', runtime);

    expect(disabled.instance.lifecycleState).toBe('disabled');
    expect(hidden.instance.lifecycleState).toBe('hidden');
    expect(runtime.windowAdapter.close).toHaveBeenCalledTimes(2);
  });

  it('deletes an instance after closing its window', async () => {
    const runtime = createRuntime();
    await seedInstance(runtime);

    await deletePluginInstanceOnDesktop('instance-1', runtime);

    expect(runtime.store.list()).toEqual([]);
    expect(runtime.windowAdapter.close).toHaveBeenCalledWith('instance-1');
  });

  it('updates config and syncs enabled windows only', async () => {
    const runtime = createRuntime();
    await seedInstance(runtime);

    const updated = await updatePluginInstanceConfigOnDesktop(
      'instance-1',
      {
        placement: { x: 200, y: 160 },
        size: { preset: 'large', width: 420, height: 320 },
        style: { mode: 'minimal', opacity: 0.7 },
      },
      runtime,
    );
    await runtime.store.hide('instance-1');
    const hidden = await updatePluginInstanceConfigOnDesktop(
      'instance-1',
      {
        style: { opacity: 0.5 },
      },
      runtime,
    );

    expect(updated.window?.rect).toEqual({ x: 200, y: 160, width: 420, height: 320 });
    expect(hidden.window).toBeUndefined();
    expect(runtime.windowAdapter.update).toHaveBeenCalledTimes(1);
  });
});
