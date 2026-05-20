import type { Rect } from './grid';

/** Window type classification */
export type WindowType = 'main' | 'control' | 'grid' | 'console' | 'account' | 'widget' | 'pet';

/** Window label patterns */
export type WindowLabel =
  | 'main'
  | 'control'
  | 'console'
  | 'account'
  | 'pet'
  | `grid_${string}`
  | `widget_${string}`;

export type GridWindowLabel = `grid_${string}`;

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

export interface CommandError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
}
