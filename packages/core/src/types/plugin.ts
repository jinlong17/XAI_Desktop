import type { ComponentType } from 'react';

/** Content types a plugin can render in grid windows */
export type ContentType = string;

/** Plugin manifest — the metadata file each plugin provides */
export interface PluginManifest {
  name: string;
  version: string;
  displayName: string;
  description: string;
  author: string;
  enabled: boolean;
  contentTypes: ContentType[];
  windows: {
    overlay?: boolean;
    control?: boolean;
    grid?: boolean;
    console?: boolean;
  };
  ui?: {
    consoleSidebar?: {
      entries: ConsoleSidebarEntry[];
    };
  };
  events: {
    emit: string[];
    listen: string[];
  };
  dependencies: string[];
  tauriCommands: string[];
}

export type ConsoleModuleId = string;

export interface ConsoleRouteState {
  moduleId: ConsoleModuleId;
  listId?: string;
  detailId?: string;
}

export interface ConsoleThemeState {
  mode: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  fontScale: number;
}

export interface ConsoleViewCapabilities {
  navigate(route: ConsoleRouteState): void;
  openCommandPalette(query?: string): void;
  focusPane(pane: 'sidebar' | 'list' | 'detail'): void;
  persistState(partial: Partial<ConsoleRouteState>): Promise<void>;
  requestReconcile(reason?: string): Promise<void>;
}

export interface ConsoleViewProps {
  moduleId: ConsoleModuleId;
  route: ConsoleRouteState;
  selection: Record<string, string | number | boolean | null>;
  query: string;
  theme: ConsoleThemeState;
  capabilities: ConsoleViewCapabilities;
}

export interface ConsoleSidebarEntry {
  id: string;
  label: string;
  icon: string;
  order: number;
  group: string;
  enabled: boolean;
  placeholder: boolean;
  moduleId: ConsoleModuleId;
}

export interface ConsoleViewRegistration {
  moduleId: ConsoleModuleId;
  sidebar: ConsoleSidebarEntry;
  render: ComponentType<ConsoleViewProps>;
}

export interface ConsoleViewDefinition {
  moduleId: ConsoleModuleId;
  render: ComponentType<ConsoleViewProps>;
}

/** React components a plugin registers */
export interface PluginComponents {
  /** Rendered on the main window overlay */
  OverlayLayer?: ComponentType;
  /** Rendered in the control window */
  ControlWidget?: ComponentType;
  /** Rendered inside grid windows */
  GridContent?: ComponentType<{ gridId: string }>;
  /** Rendered in settings panel */
  SettingsPanel?: ComponentType;
  /** Rendered inside the Console shell by module slot */
  ConsoleViews?: ConsoleViewDefinition[];
}

/** A registered plugin — manifest + components */
export interface PluginRegistration {
  manifest: PluginManifest;
  components: PluginComponents;
}
