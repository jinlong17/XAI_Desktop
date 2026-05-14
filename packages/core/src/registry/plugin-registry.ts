import type {
  PluginManifest,
  PluginComponents,
  PluginRegistration,
} from '../types/plugin';
import type { ComponentType } from 'react';

class PluginRegistryImpl {
  private plugins = new Map<string, PluginRegistration>();

  register(manifest: PluginManifest, components: PluginComponents): void {
    this.plugins.set(manifest.name, { manifest, components });
  }

  getPlugin(name: string): PluginRegistration | undefined {
    return this.plugins.get(name);
  }

  getAllEnabled(): PluginRegistration[] {
    return [...this.plugins.values()].filter((p) => p.manifest.enabled);
  }

  getOverlayLayers(): ComponentType[] {
    return this.getAllEnabled()
      .map((p) => p.components.OverlayLayer)
      .filter(Boolean) as ComponentType[];
  }

  getControlWidgets(): ComponentType[] {
    return this.getAllEnabled()
      .map((p) => p.components.ControlWidget)
      .filter(Boolean) as ComponentType[];
  }

  getGridContents(): Map<string, ComponentType<{ gridId: string }>> {
    const map = new Map<string, ComponentType<{ gridId: string }>>();
    for (const p of this.getAllEnabled()) {
      if (p.components.GridContent) {
        map.set(p.manifest.name, p.components.GridContent);
      }
    }
    return map;
  }
}

export const PluginRegistry = new PluginRegistryImpl();
