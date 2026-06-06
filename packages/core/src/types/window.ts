import type { Rect } from './grid';
import type {
  PluginInstanceBehavior,
  PluginInstanceConfig,
  PluginInstancePlacement,
  PluginInstanceSize,
  PluginInstanceStyle,
} from './plugin';

/** Window type classification */
export type WindowType =
  | 'main'
  | 'control'
  | 'grid'
  | 'console'
  | 'plugin-center'
  | 'account'
  | 'widget'
  | 'pet';

/** Window label patterns */
export type WindowLabel =
  | 'main'
  | 'control'
  | 'console'
  | 'plugin-center'
  | 'account'
  | 'pet'
  | `grid_${string}`
  | `widget_${string}`;

export type GridWindowLabel = `grid_${string}`;

export type PluginHostWindowSurface = 'grid';

export type PluginWindowCommandSourceLabel = 'main' | 'control' | 'plugin-center';

/** Window configuration */
export interface WindowConfig {
  label: WindowLabel;
  type: WindowType;
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  decorations?: boolean;
  transparent?: boolean;
  alwaysOnTop?: boolean;
}

export type GridWindowRect = Rect;

export interface CreateGridWindowInput {
  gridId: string;
  rect: GridWindowRect;
}

export interface UpdateGridWindowInput {
  gridId: string;
  rect: GridWindowRect;
}

export interface GridWindowSnapshot {
  gridId: string;
  label: GridWindowLabel;
  rect: GridWindowRect;
  visible: boolean;
}

export interface PluginWindowSnapshot {
  instanceId: string;
  label: GridWindowLabel;
  surface: PluginHostWindowSurface;
  rect: GridWindowRect;
  visible: boolean;
  placement: PluginInstancePlacement;
  size: PluginInstanceSize;
  behavior: PluginInstanceBehavior;
  style: PluginInstanceStyle;
  nativeApplied: {
    placement: boolean;
    size: boolean;
    opacity: boolean;
    clickThrough: boolean;
    pinned: boolean;
    allSpaces: boolean;
  };
}

export interface CreatePluginWindowInput {
  instanceId: string;
  config: PluginInstanceConfig;
}

export interface UpdatePluginWindowInput {
  instanceId: string;
  config: PluginInstanceConfig;
}

export interface ConsoleWindowFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  isFullscreen: boolean;
  navStateVersion: number;
}

export interface PluginCenterWindowFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  isFullscreen: boolean;
  navStateVersion: number;
}

export interface CommandError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
}
