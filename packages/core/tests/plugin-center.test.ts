import { describe, expect, it } from 'vitest';
import {
  createAddToDesktopRequest,
  createPluginCenterEntries,
  createPluginCenterEntry,
  createPluginInstance,
  getPluginSupportedSurfaces,
} from '../src/registry/plugin-center';
import type { PluginManifest, PluginRegistration } from '../src/types/plugin';

function createManifest(overrides: Partial<PluginManifest> = {}): PluginManifest {
  return {
    name: 'widgets',
    version: '0.1.0',
    displayName: 'Desktop Widgets',
    description: 'Built-in time widgets',
    author: 'Test',
    enabled: true,
    contentTypes: ['widget'],
    windows: {
      overlay: true,
      control: true,
    },
    events: {
      emit: [],
      listen: [],
    },
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

describe('plugin center contract', () => {
  it('maps manifest windows into desktop plugin surfaces', () => {
    const surfaces = getPluginSupportedSurfaces(
      createManifest({
        windows: {
          overlay: true,
          control: false,
          grid: true,
          console: false,
        },
      }),
    );

    expect(surfaces).toEqual(['overlay', 'grid']);
  });

  it('creates a Plugin Center entry from a manifest registration', () => {
    const entry = createPluginCenterEntry(createRegistration());

    expect(entry).toMatchObject({
      pluginName: 'widgets',
      displayName: 'Desktop Widgets',
      status: 'available',
      enabledByManifest: true,
      contentTypes: ['widget'],
      supportedSurfaces: ['overlay', 'control'],
      defaultContentType: 'widget',
      canAddToDesktop: true,
      canOpenSettings: false,
    });
  });

  it('creates Plugin Center entries for built-in manifests without auto-enabling planned packages', () => {
    const organizer = createRegistration({
      name: 'organizer',
      version: '1.0.0',
      displayName: '智能桌面整理',
      enabled: true,
      contentTypes: ['normal-window-organizer'],
      windows: {},
    });
    const widgets = createRegistration({
      name: 'widgets',
      enabled: false,
      contentTypes: ['widget'],
      windows: { overlay: true, control: true },
    });
    const clipboard = createRegistration({
      name: 'clipboard',
      enabled: false,
      contentTypes: ['clipboard-entry'],
      windows: { control: true },
    });

    const entries = createPluginCenterEntries([organizer, widgets, clipboard], {
      statusByPluginName: {
        widgets: 'planned',
      },
      unavailableReasonByPluginName: {
        widgets: 'Platform runtime is not ready yet',
      },
    });

    expect(entries).toEqual([
      expect.objectContaining({
        pluginName: 'organizer',
        status: 'available',
        enabledByManifest: true,
        defaultContentType: 'normal-window-organizer',
        canAddToDesktop: true,
      }),
      expect.objectContaining({
        pluginName: 'widgets',
        status: 'planned',
        enabledByManifest: false,
        supportedSurfaces: ['overlay', 'control'],
        canAddToDesktop: false,
        unavailableReason: 'Platform runtime is not ready yet',
      }),
      expect.objectContaining({
        pluginName: 'clipboard',
        status: 'disabled',
        enabledByManifest: false,
        supportedSurfaces: ['control'],
        canAddToDesktop: false,
      }),
    ]);
  });

  it('keeps planned or disabled manifests out of add-to-desktop by default', () => {
    const disabledEntry = createPluginCenterEntry(createRegistration({ enabled: false }));
    const plannedEntry = createPluginCenterEntry(createRegistration(), {
      status: 'planned',
      unavailableReason: 'Platform runtime is not ready yet',
    });

    expect(disabledEntry.canAddToDesktop).toBe(false);
    expect(plannedEntry).toMatchObject({
      status: 'planned',
      canAddToDesktop: false,
      unavailableReason: 'Platform runtime is not ready yet',
    });
  });

  it('creates an AddToDesktop request with stable default instance config', () => {
    const request = createAddToDesktopRequest(createPluginCenterEntry(createRegistration()), {
      config: {
        placement: { x: 128, y: 256, displayId: 'main' },
        style: { opacity: 0.72 },
        behavior: { pinned: true },
      },
    });

    expect(request).toEqual({
      pluginName: 'widgets',
      contentType: 'widget',
      source: 'plugin-center',
      config: {
        placement: { x: 128, y: 256, displayId: 'main' },
        size: { preset: 'medium', width: 320, height: 240 },
        behavior: {
          pinned: true,
          clickThrough: false,
          allSpaces: false,
          clickAction: 'focus',
        },
        style: {
          mode: 'system',
          opacity: 0.72,
        },
        dataSource: undefined,
      },
    });
  });

  it('creates a device-local PluginInstance from an AddToDesktop request', () => {
    const request = createAddToDesktopRequest(createPluginCenterEntry(createRegistration()));
    const instance = createPluginInstance(request, {
      id: 'plugin-instance-1',
      now: '2026-06-04T12:00:00.000Z',
    });

    expect(instance).toMatchObject({
      id: 'plugin-instance-1',
      pluginName: 'widgets',
      contentType: 'widget',
      schemaVersion: 1,
      lifecycleState: 'enabled',
      syncScope: 'device-local',
      createdAt: '2026-06-04T12:00:00.000Z',
      updatedAt: '2026-06-04T12:00:00.000Z',
    });
  });

  it('rejects add-to-desktop requests when no content type is declared', () => {
    const entry = createPluginCenterEntry(createRegistration({ contentTypes: [] }));

    expect(() => createAddToDesktopRequest(entry)).toThrow(
      'Plugin widgets does not declare a desktop content type',
    );
  });
});
