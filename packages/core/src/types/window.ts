/** Window type classification */
export type WindowType = 'main' | 'control' | 'grid' | 'widget';

/** Window label patterns */
export type WindowLabel =
  | 'main'
  | 'control'
  | `grid_${string}`
  | `widget_${string}`;

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
