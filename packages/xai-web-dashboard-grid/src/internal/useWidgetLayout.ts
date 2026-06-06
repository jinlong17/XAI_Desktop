/**
 * useWidgetLayout — persisted per-widget size hints for the dashboard grid.
 *
 * Order/position remains owned by xai_dash_order. This hook stores only size
 * hints in the open xai_pref_* family so existing dashboard order migrations
 * are not disturbed.
 */
import { useCallback, useEffect, useMemo, useState, type PointerEvent } from "react";

import { getPrefAutosave, setPrefAutosave } from "@repo/plugin-web-storage";

import type { WidgetRegistration, WidgetSpanClass } from "../types.js";

const LAYOUT_PREF_SUFFIX = "dashboard_widget_layout";
const LAYOUT_PREF_KEY = `xai_pref_${LAYOUT_PREF_SUFFIX}`;
const MIN_COLS = 2;
const MAX_COLS = 12;
const MIN_HEIGHT = 112;
const MAX_HEIGHT = 460;

export interface WidgetLayoutItem {
  readonly cols: number;
  readonly minHeight: number;
}

export type WidgetLayoutMap = Record<string, WidgetLayoutItem>;

export interface ResizeStartSnapshot {
  readonly id: string;
  readonly startX: number;
  readonly startY: number;
  readonly startCols: number;
  readonly startHeight: number;
  readonly colWidth: number;
}

const DEFAULT_LAYOUT_BY_SPAN: Record<WidgetSpanClass, WidgetLayoutItem> = {
  "w-clock": { cols: 6, minHeight: 166 },
  "w-stat": { cols: 2, minHeight: 118 },
  "w-weather": { cols: 6, minHeight: 156 },
  "w-timetrack": { cols: 4, minHeight: 160 },
  "w-mini-cal": { cols: 4, minHeight: 246 },
  "w-timezones": { cols: 4, minHeight: 210 },
  "w-stickies": { cols: 4, minHeight: 210 },
  "w-mail": { cols: 4, minHeight: 210 },
  "w-upcoming": { cols: 8, minHeight: 210 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeItem(value: unknown): WidgetLayoutItem | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.cols !== "number" || typeof record.minHeight !== "number") return null;
  return {
    cols: clamp(Math.round(record.cols), MIN_COLS, MAX_COLS),
    minHeight: clamp(Math.round(record.minHeight), MIN_HEIGHT, MAX_HEIGHT),
  };
}

function normalizeMap(value: unknown): WidgetLayoutMap {
  if (typeof value !== "object" || value === null) return {};
  const next: WidgetLayoutMap = {};
  for (const [id, raw] of Object.entries(value as Record<string, unknown>)) {
    const normalized = normalizeItem(raw);
    if (normalized) next[id] = normalized;
  }
  return next;
}

function readLayout(): WidgetLayoutMap {
  return normalizeMap(
    getPrefAutosave<WidgetLayoutMap>(LAYOUT_PREF_SUFFIX, {
      codec: "json",
      defaultValue: {},
    }),
  );
}

export function defaultWidgetLayout(span: WidgetSpanClass): WidgetLayoutItem {
  return DEFAULT_LAYOUT_BY_SPAN[span];
}

function writeLayout(next: WidgetLayoutMap): void {
  setPrefAutosave(LAYOUT_PREF_SUFFIX, next, { codec: "json" });
}

function computeColumnWidth(gridEl: HTMLElement | null): number {
  if (!gridEl) return 96;
  const rect = gridEl.getBoundingClientRect();
  const styles = window.getComputedStyle(gridEl);
  const gap = parseFloat(styles.columnGap || styles.gap || "0");
  const usable = Math.max(1, rect.width - gap * 11);
  return Math.max(36, usable / 12 + gap);
}

export function useWidgetLayout(widgets: readonly WidgetRegistration[]) {
  const [layoutMap, setLayoutMap] = useState<WidgetLayoutMap>(() => readLayout());

  const knownIds = useMemo(() => new Set(widgets.map((w) => w.id)), [widgets]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LAYOUT_PREF_KEY) setLayoutMap(readLayout());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getLayout = useCallback(
    (id: string, span: WidgetSpanClass): WidgetLayoutItem => {
      if (!knownIds.has(id)) return defaultWidgetLayout(span);
      return layoutMap[id] ?? defaultWidgetLayout(span);
    },
    [knownIds, layoutMap],
  );

  const setWidgetLayout = useCallback(
    (id: string, nextItem: WidgetLayoutItem) => {
      if (!knownIds.has(id)) return;
      const normalized = normalizeItem(nextItem);
      if (!normalized) return;
      setLayoutMap((prev) => {
        const next = { ...prev, [id]: normalized };
        writeLayout(next);
        return next;
      });
    },
    [knownIds],
  );

  const createResizeSnapshot = useCallback(
    (
      id: string,
      span: WidgetSpanClass,
      event: PointerEvent<HTMLElement>,
      gridEl: HTMLElement | null,
    ): ResizeStartSnapshot => {
      const current = getLayout(id, span);
      return {
        id,
        startX: event.clientX,
        startY: event.clientY,
        startCols: current.cols,
        startHeight: current.minHeight,
        colWidth: computeColumnWidth(gridEl),
      };
    },
    [getLayout],
  );

  return { getLayout, setWidgetLayout, createResizeSnapshot } as const;
}

export function layoutFromResize(
  snapshot: ResizeStartSnapshot,
  clientX: number,
  clientY: number,
): WidgetLayoutItem {
  const nextCols = snapshot.startCols + Math.round((clientX - snapshot.startX) / snapshot.colWidth);
  const nextHeight = snapshot.startHeight + (clientY - snapshot.startY);
  return {
    cols: clamp(nextCols, MIN_COLS, MAX_COLS),
    minHeight: clamp(nextHeight, MIN_HEIGHT, MAX_HEIGHT),
  };
}
