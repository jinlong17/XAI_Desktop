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
});
