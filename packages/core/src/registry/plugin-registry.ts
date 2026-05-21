import type {
  PluginManifest,
  PluginComponents,
  PluginRegistration,
  ConsoleSidebarEntry,
  ConsoleViewProps,
  ConsoleViewRegistration,
} from '../types/plugin';
import type { ComponentType } from 'react';

class PluginRegistryImpl {
  private plugins = new Map<string, PluginRegistration>();
  private static readonly missingConsoleView: ComponentType<ConsoleViewProps> = () => null;

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

  getConsoleViewRegistrations(): ConsoleViewRegistration[] {
    return this.getAllEnabled()
      .filter((plugin) => plugin.manifest.windows.console)
      .flatMap((plugin) => {
        const viewsByModule = new Map(
          (plugin.components.ConsoleViews ?? []).map((view) => [view.moduleId, view.render]),
        );
        const entries = plugin.manifest.ui?.consoleSidebar?.entries ?? [];
        return entries
          .filter((entry) => entry.enabled)
          .map((entry) => ({
            moduleId: entry.moduleId,
            sidebar: entry,
            render:
              viewsByModule.get(entry.moduleId) ??
              PluginRegistryImpl.missingConsoleView,
          }));
      })
      .sort((a, b) => a.sidebar.order - b.sidebar.order || a.sidebar.label.localeCompare(b.sidebar.label));
  }

  getConsoleSidebarEntries(): ConsoleSidebarEntry[] {
    return this.getConsoleViewRegistrations().map((registration) => registration.sidebar);
  }
}

export const PluginRegistry = new PluginRegistryImpl();
