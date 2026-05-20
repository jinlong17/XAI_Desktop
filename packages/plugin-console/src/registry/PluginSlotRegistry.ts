import type { ConsoleNavItem, SearchableEntity } from "../types";

export type SearchProvider = () => SearchableEntity[] | Promise<SearchableEntity[]>;

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

  async getSearchEntities(): Promise<SearchableEntity[]> {
    const results = await Promise.all([...this.searchProviders.values()].map((provider) => provider()));
    return results.flat();
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
