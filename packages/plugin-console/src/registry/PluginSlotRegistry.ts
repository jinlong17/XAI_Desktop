import type { ConsoleNavItem, SearchableEntity } from "../types";

export type SearchProvider = () => SearchableEntity[] | Promise<SearchableEntity[]>;
export interface SearchSnapshot {
  entities: SearchableEntity[];
  timedOutProviders: string[];
  failedProviders: string[];
}

export class PluginSlotRegistry {
  private readonly navItems = new Map<string, ConsoleNavItem>();
  private readonly searchProviders = new Map<string, SearchProvider>();

  registerNavItem(item: ConsoleNavItem): () => void {
    this.navItems.set(item.id, item);
    return () => this.navItems.delete(item.id);
  }

  getNavItems(): ConsoleNavItem[] {
    return [...this.navItems.values()].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  }

  registerSearchProvider(pluginId: string, provider: SearchProvider): () => void {
    this.searchProviders.set(pluginId, provider);
    return () => this.searchProviders.delete(pluginId);
  }

  async getSearchEntities(timeoutMs = 200): Promise<SearchSnapshot> {
    const timedOutProviders: string[] = [];
    const failedProviders: string[] = [];
    const providers = [...this.searchProviders.entries()];
    const results = await Promise.all(
      providers.map(async ([pluginId, provider]) => {
        try {
          const value = await Promise.race([
            Promise.resolve(provider()),
            new Promise<null>((resolve) => {
              globalThis.setTimeout(() => resolve(null), timeoutMs);
            }),
          ]);
          if (!value) {
            timedOutProviders.push(pluginId);
            return [];
          }
          return value;
        } catch {
          failedProviders.push(pluginId);
          return [];
        }
      }),
    );
    return {
      entities: results.flat(),
      timedOutProviders,
      failedProviders,
    };
  }
}

export function createDefaultConsoleNavItems(): ConsoleNavItem[] {
  return [
    { id: "labels", pluginId: "labels", label: "Labels", icon: "tag", order: 10 },
    { id: "todos", pluginId: "productivity", label: "Todos", icon: "check-square", order: 20 },
    { id: "pomodoro", pluginId: "productivity", label: "Pomodoro", icon: "timer", order: 30 },
    { id: "habits", pluginId: "productivity", label: "Habits", icon: "repeat", order: 40 },
    { id: "clipboard", pluginId: "clipboard", label: "Clipboard", icon: "clipboard", order: 50 },
    { id: "projects", pluginId: "project", label: "Projects", icon: "kanban", order: 60 },
    { id: "notifications", pluginId: "console", label: "Notifications", icon: "bell", order: 90 },
    { id: "settings", pluginId: "console", label: "Settings", icon: "settings", order: 100 },
  ];
}
