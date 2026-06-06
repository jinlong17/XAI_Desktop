import type { ComponentType } from 'react';

/** Content types a plugin can render in grid windows */
export type ContentType = string;

export type PluginInstanceId = string;

export type PluginCenterEntryStatus =
  | 'available'
  | 'disabled'
  | 'planned'
  | 'shipped'
  | 'unavailable';

export type PluginWindowSurface = 'overlay' | 'control' | 'grid' | 'console';

export type PluginInstanceLifecycleState =
  | 'enabled'
  | 'disabled'
  | 'hidden'
  | 'destroyed';

export type PluginInstanceSyncScope = 'device-local';

export type PluginInstanceSizePreset = 'small' | 'medium' | 'large';

export type PluginInstanceStyleMode = 'system' | 'light' | 'dark' | 'minimal';

export interface PluginInstancePlacement {
  x: number;
  y: number;
  displayId?: string;
  spaceId?: string;
}

export interface PluginInstanceSize {
  preset: PluginInstanceSizePreset;
  width: number;
  height: number;
}

export interface PluginInstanceBehavior {
  pinned: boolean;
  clickThrough: boolean;
  allSpaces: boolean;
  clickAction: 'focus' | 'open-settings' | 'none';
}

export interface PluginInstanceStyle {
  mode: PluginInstanceStyleMode;
  opacity: number;
}

export interface PluginInstanceConfig {
  placement: PluginInstancePlacement;
  size: PluginInstanceSize;
  behavior: PluginInstanceBehavior;
  style: PluginInstanceStyle;
  dataSource?: Record<string, unknown>;
}

export interface PluginInstanceConfigInput {
  placement?: Partial<PluginInstancePlacement>;
  size?: Partial<PluginInstanceSize>;
  behavior?: Partial<PluginInstanceBehavior>;
  style?: Partial<PluginInstanceStyle>;
  dataSource?: Record<string, unknown>;
}

export interface PluginInstance {
  id: PluginInstanceId;
  pluginName: string;
  contentType: ContentType;
  schemaVersion: number;
  lifecycleState: PluginInstanceLifecycleState;
  syncScope: PluginInstanceSyncScope;
  config: PluginInstanceConfig;
  createdAt: string;
  updatedAt: string;
}

export interface PluginCenterEntry {
  pluginName: string;
  displayName: string;
  description: string;
  version: string;
  status: PluginCenterEntryStatus;
  enabledByManifest: boolean;
  contentTypes: ContentType[];
  supportedSurfaces: PluginWindowSurface[];
  defaultContentType?: ContentType;
  canAddToDesktop: boolean;
  canOpenSettings: boolean;
  unavailableReason?: string;
}

export interface AddToDesktopRequest {
  pluginName: string;
  contentType: ContentType;
  source: 'plugin-center' | 'deep-link' | 'restore' | 'test';
  config: PluginInstanceConfig;
}

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

export type ConsoleCapabilityStatus = "supported" | "unsupported" | "blocked";

export type ConsoleCapabilityErrorCode =
  | "unsupported_in_browser"
  | "permission_denied"
  | "not_configured"
  | "build_blocked";

export type ConsoleCapabilityResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: ConsoleCapabilityErrorCode; message: string };

export interface ConsoleShortcutBinding {
  id: string;
  combo: string;
  scope: "route" | "app";
}

export interface ConsoleDownloadRequest {
  filename: string;
  blob: Blob;
  mimeType?: string;
}

export interface ConsoleNotificationRequest {
  title: string;
  body?: string;
  tag?: string;
}

export interface ConsoleViewCapabilities {
  navigate(route: ConsoleRouteState): void;
  openSettings(section?: string): void;
  openCommandPalette(query?: string): void;
  focusPane(pane: 'sidebar' | 'list' | 'detail'): void;
  persistState(partial: Partial<ConsoleRouteState>): Promise<void>;
  requestReconcile(reason?: string): Promise<void>;
  download(request: ConsoleDownloadRequest): Promise<ConsoleCapabilityResult<void>>;
  notify(request: ConsoleNotificationRequest): Promise<ConsoleCapabilityResult<void>>;
  registerShortcut(
    binding: ConsoleShortcutBinding,
    handler: () => void,
  ): ConsoleCapabilityResult<() => void>;
  beginDrag(payload: unknown): Promise<ConsoleCapabilityResult<void>>;
  invokeNativeCapability(name: string, payload?: unknown): Promise<ConsoleCapabilityResult<void>>;
  status(capability: string): ConsoleCapabilityStatus;
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

export interface WebModuleRouteProps {
  moduleId: ConsoleModuleId;
  childPath: string;
  capabilities: ConsoleViewCapabilities;
}

export interface WebModuleRouteChild {
  path: string;
  render: ComponentType<WebModuleRouteProps>;
}

export interface WebModuleRouteRegistration {
  moduleId: ConsoleModuleId;
  label: string;
  defaultChildPath?: string;
  children: WebModuleRouteChild[];
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
