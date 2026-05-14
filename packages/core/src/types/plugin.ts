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
  };
  events: {
    emit: string[];
    listen: string[];
  };
  dependencies: string[];
  tauriCommands: string[];
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
}

/** A registered plugin — manifest + components */
export interface PluginRegistration {
  manifest: PluginManifest;
  components: PluginComponents;
}
