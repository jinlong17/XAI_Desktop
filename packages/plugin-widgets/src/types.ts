import type { ReactNode } from "react";
import type { RepoRecord } from "@repo/core-data";

export type WidgetDensity = "compact" | "comfortable";
export type WidgetTheme = "system" | "light" | "dark";

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface WidgetEntity extends RepoRecord {
  entityType: "widgets.widget";
  type: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: Record<string, unknown>;
  visible: boolean;
  version: number;
  deletedAt?: string;
}

export interface WidgetComponentProps<TConfig = Record<string, unknown>> {
  widget: WidgetEntity;
  config: TConfig;
  density: WidgetDensity;
}

export interface WidgetDefinition<TConfig = Record<string, unknown>> {
  type: string;
  title: string;
  defaultSize: WidgetSize;
  minSize?: WidgetSize;
  defaultConfig: TConfig;
  render(props: WidgetComponentProps<TConfig>): ReactNode;
}

export interface WidgetManifestRegistration {
  pluginName: string;
  widgets: readonly WidgetDefinition[];
}

export interface WidgetPreferences {
  density: WidgetDensity;
  theme: WidgetTheme;
  wallpaperTone: "light" | "dark" | "mixed";
  contrast: "standard" | "high";
}

export interface ThemeTokens {
  background: string;
  foreground: string;
  muted: string;
  border: string;
  accent: string;
  danger: string;
  fontFamily: string;
  radius: string;
}

export interface HabitHistoryDay {
  date: string;
  completed: number;
  target: number;
}
