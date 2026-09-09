/**
 * useWidgetAppearance — persisted per-widget glass background preferences.
 *
 * Layout/order are stored separately. This hook owns only the visual tint and
 * opacity for each widget card shell.
 */
import { useCallback, useMemo } from "react";

import { useWidgetMapRecovery } from "./useWidgetMapRecovery.js";

import type { WidgetRegistration } from "../types.js";

const APPEARANCE_PREF_SUFFIX = "dashboard_widget_appearance";
const MIN_ALPHA = 0.18;
const MAX_ALPHA = 0.72;

export type WidgetGlassTone =
  | "clear"
  | "aqua"
  | "mint"
  | "sky"
  | "lilac"
  | "rose"
  | "amber"
  | "slate";

export interface WidgetAppearanceItem {
  readonly tone: WidgetGlassTone;
  readonly alpha: number;
}

export type WidgetAppearanceMap = Record<string, WidgetAppearanceItem>;

export interface WidgetGlassToneMeta {
  readonly tone: WidgetGlassTone;
  readonly rgb: string;
  readonly label: {
    readonly en: string;
    readonly zh: string;
  };
}

const DEFAULT_TONE_META: WidgetGlassToneMeta = {
  tone: "clear",
  rgb: "255 255 255",
  label: { en: "Clear", zh: "透明" },
};

export const DEFAULT_WIDGET_APPEARANCE: WidgetAppearanceItem = {
  tone: "clear",
  alpha: 0.42,
};

export const WIDGET_GLASS_TONES: readonly WidgetGlassToneMeta[] = [
  DEFAULT_TONE_META,
  { tone: "aqua", rgb: "178 232 229", label: { en: "Aqua", zh: "水蓝" } },
  { tone: "mint", rgb: "194 232 202", label: { en: "Mint", zh: "薄荷" } },
  { tone: "sky", rgb: "190 220 255", label: { en: "Sky", zh: "天空" } },
  { tone: "lilac", rgb: "218 202 255", label: { en: "Lilac", zh: "丁香" } },
  { tone: "rose", rgb: "255 204 219", label: { en: "Rose", zh: "玫瑰" } },
  { tone: "amber", rgb: "255 225 176", label: { en: "Amber", zh: "琥珀" } },
  { tone: "slate", rgb: "214 224 232", label: { en: "Slate", zh: "雾灰" } },
] as const;

const KNOWN_TONES = new Set<WidgetGlassTone>(WIDGET_GLASS_TONES.map((tone) => tone.tone));

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeAlpha(value: number): number {
  return Math.round(clamp(value, MIN_ALPHA, MAX_ALPHA) * 100) / 100;
}

function formatAlpha(value: number, min: number, max: number): string {
  return String(Math.round(clamp(value, min, max) * 100) / 100);
}

function normalizeItem(value: unknown): WidgetAppearanceItem | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.tone !== "string" || !KNOWN_TONES.has(record.tone as WidgetGlassTone)) {
    return null;
  }
  if (typeof record.alpha !== "number") return null;
  return {
    tone: record.tone as WidgetGlassTone,
    alpha: normalizeAlpha(record.alpha),
  };
}

function normalizeMap(value: unknown): WidgetAppearanceMap {
  if (typeof value !== "object" || value === null) return {};
  const next: WidgetAppearanceMap = {};
  for (const [id, raw] of Object.entries(value as Record<string, unknown>)) {
    const normalized = normalizeItem(raw);
    if (normalized) next[id] = normalized;
  }
  return next;
}

export function toneMetaFor(tone: WidgetGlassTone): WidgetGlassToneMeta {
  return WIDGET_GLASS_TONES.find((item) => item.tone === tone) ?? DEFAULT_TONE_META;
}

export function widgetAppearanceCssVars(
  appearance: WidgetAppearanceItem,
): Record<string, string> {
  const normalized = normalizeItem(appearance) ?? DEFAULT_WIDGET_APPEARANCE;
  const alpha = normalizeAlpha(normalized.alpha);
  return {
    "--dash-widget-glass-rgb": toneMetaFor(normalized.tone).rgb,
    "--dash-widget-glass-alpha": String(alpha),
    "--dash-widget-glass-hover-alpha": String(normalizeAlpha(alpha + 0.12)),
    "--dash-widget-glass-border-alpha": String(normalizeAlpha(alpha + 0.08)),
    "--dash-widget-glass-dark-alpha": formatAlpha(alpha * 0.42, 0.08, 0.32),
    "--dash-widget-glass-dark-hover-alpha": formatAlpha(alpha * 0.52, 0.1, 0.38),
    "--dash-widget-glass-dark-border-alpha": formatAlpha(alpha * 0.5, 0.12, 0.36),
  };
}

export function useWidgetAppearance(widgets: readonly WidgetRegistration[]) {
  const { value: appearanceMap, update, recovery } = useWidgetMapRecovery(APPEARANCE_PREF_SUFFIX, normalizeMap);

  const knownIds = useMemo(() => new Set(widgets.map((w) => w.id)), [widgets]);

  const getAppearance = useCallback(
    (id: string): WidgetAppearanceItem => {
      if (!knownIds.has(id)) return DEFAULT_WIDGET_APPEARANCE;
      return appearanceMap[id] ?? DEFAULT_WIDGET_APPEARANCE;
    },
    [appearanceMap, knownIds],
  );

  const setWidgetAppearance = useCallback(
    (id: string, nextItem: WidgetAppearanceItem) => {
      if (!knownIds.has(id)) return;
      const normalized = normalizeItem(nextItem);
      if (!normalized) return;
      return update(prev => ({ ...prev, [id]: normalized }));
    },
    [knownIds, update],
  );

  const resetWidgetAppearance = useCallback(
    (id: string) => {
      if (!knownIds.has(id)) return;
      return update((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [knownIds, update],
  );

  return { getAppearance, setWidgetAppearance, resetWidgetAppearance, recovery } as const;
}
