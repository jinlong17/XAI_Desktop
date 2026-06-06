import { describe, it, expect, beforeEach } from 'vitest';

// Test the PluginRegistry directly by importing its implementation
// Note: We test the class behavior, not the singleton, to avoid cross-test pollution

describe('PluginRegistry', () => {
  // We'll dynamically import to get a fresh module for each test
  const createMockManifest = (name: string, enabled = true) => ({
    name,
    version: '1.0.0',
    displayName: `Test Plugin: ${name}`,
    description: `Test plugin ${name}`,
    author: 'Test',
    enabled,
    contentTypes: [],
    windows: {},
    events: { emit: [], listen: [] },
    dependencies: [],
    tauriCommands: [],
  });

  it('should be importable', async () => {
    const { PluginRegistry } = await import('../src/registry/plugin-registry');
    expect(PluginRegistry).toBeDefined();
  });

  it('should register and retrieve a plugin', async () => {
    const { PluginRegistry } = await import('../src/registry/plugin-registry');
    const manifest = createMockManifest('test-plugin');
    const components = {};

    PluginRegistry.register(manifest, components);

    const plugin = PluginRegistry.getPlugin('test-plugin');
    expect(plugin).toBeDefined();
    expect(plugin?.manifest.name).toBe('test-plugin');
  });

  it('should filter disabled plugins from getAllEnabled', async () => {
    const { PluginRegistry } = await import('../src/registry/plugin-registry');
    PluginRegistry.register(createMockManifest('enabled-plugin', true), {});
    PluginRegistry.register(createMockManifest('disabled-plugin', false), {});

    const enabled = PluginRegistry.getAllEnabled();
    const names = enabled.map((p) => p.manifest.name);
    expect(names).toContain('enabled-plugin');
    expect(names).not.toContain('disabled-plugin');
  });

  it('should expose disabled manifests to Plugin Center without mounting them', async () => {
    const { PluginRegistry } = await import('../src/registry/plugin-registry');
    PluginRegistry.register(createMockManifest('center-organizer', true), {});
    PluginRegistry.register(createMockManifest('center-widgets', false), {
      OverlayLayer: (() => null) as any,
    });

    const centerEntries = PluginRegistry.getPluginCenterEntries({
      statusByPluginName: {
        'center-widgets': 'planned',
      },
    });
    const organizerEntry = centerEntries.find((entry) => entry.pluginName === 'center-organizer');
    const widgetsEntry = centerEntries.find((entry) => entry.pluginName === 'center-widgets');
    const mountedOverlayCount = PluginRegistry.getOverlayLayers().length;

    expect(organizerEntry).toMatchObject({
      status: 'available',
      canAddToDesktop: true,
    });
    expect(widgetsEntry).toMatchObject({
      status: 'planned',
      enabledByManifest: false,
      canAddToDesktop: false,
    });
    expect(mountedOverlayCount).toBe(0);
  });

  it('should expose console registrations from enabled console plugins only', async () => {
    const { PluginRegistry } = await import('../src/registry/plugin-registry');
    PluginRegistry.register(
      {
        ...createMockManifest('console-enabled', true),
        windows: { console: true },
        ui: {
          consoleSidebar: {
            entries: [
              {
                id: 'tasks',
                label: 'Tasks',
                icon: 'check',
                order: 10,
                group: 'productivity',
                enabled: true,
                placeholder: false,
                moduleId: 'tasks',
              },
            ],
          },
        },
      },
      {
      ConsoleViews: [
        {
          moduleId: 'tasks',
          render: (() => null) as any,
        },
      ],
      },
    );
    PluginRegistry.register(
      {
        ...createMockManifest('console-disabled', false),
        windows: { console: true },
        ui: {
          consoleSidebar: {
            entries: [
              {
                id: 'labels',
                label: 'Labels',
                icon: 'tag',
                order: 20,
                group: 'labels',
                enabled: true,
                placeholder: false,
                moduleId: 'labels',
              },
            ],
          },
        },
      },
      {
        ConsoleViews: [
          {
            moduleId: 'labels',
            render: (() => null) as any,
          },
        ],
      },
    );

    const consoleModules = PluginRegistry.getConsoleViewRegistrations().map((registration) => registration.moduleId);
    expect(consoleModules).toContain('tasks');
    expect(consoleModules).not.toContain('labels');
  });
});
