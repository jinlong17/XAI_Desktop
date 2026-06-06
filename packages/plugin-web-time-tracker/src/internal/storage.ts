import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_TIME_TRACKER_CATEGORIES } from "./defaults.js";
import { entryDuration, entryStart, isRunningEntry, startOfDay, startOfWeek } from "./time.js";
import type {
  LocalizedText,
  TimeTrackerCategory,
  TimeTrackerEntry,
  TimeTrackerMode,
  TimeTrackerSnapshot,
  TimeTrackerSubcategory,
} from "../types.js";

export const TIME_TRACKER_CATEGORIES_KEY = "xai_tt_categories_v2";
export const TIME_TRACKER_ENTRIES_KEY = "xai_tt_entries_v2";
export const TIME_TRACKER_MODE_KEY = "xai_tt_mode";
export const TIME_TRACKER_STORAGE_EVENT = "xai:time-tracker-storage";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLocalizedText(value: unknown): value is LocalizedText {
  return isRecord(value) && typeof value["en"] === "string" && typeof value["zh"] === "string";
}

function isSubcategory(value: unknown): value is TimeTrackerSubcategory {
  return (
    isRecord(value) &&
    typeof value["id"] === "string" &&
    isLocalizedText(value["name"]) &&
    (value["color"] === undefined || typeof value["color"] === "string") &&
    (value["icon"] === undefined || typeof value["icon"] === "string")
  );
}

function isCategory(value: unknown): value is TimeTrackerCategory {
  return (
    isRecord(value) &&
    typeof value["id"] === "string" &&
    isLocalizedText(value["name"]) &&
    typeof value["color"] === "string" &&
    typeof value["icon"] === "string" &&
    typeof value["goalMin"] === "number" &&
    Array.isArray(value["subs"]) &&
    value["subs"].every(isSubcategory) &&
    typeof value["createdAt"] === "number" &&
    typeof value["updatedAt"] === "number"
  );
}

function isSegment(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value["start"] === "number" &&
    (typeof value["end"] === "number" || value["end"] === null)
  );
}

function isEntry(value: unknown): value is TimeTrackerEntry {
  return (
    isRecord(value) &&
    typeof value["id"] === "string" &&
    typeof value["categoryId"] === "string" &&
    (typeof value["subId"] === "string" || value["subId"] === null) &&
    Array.isArray(value["segments"]) &&
    value["segments"].length > 0 &&
    value["segments"].every(isSegment) &&
    isLocalizedText(value["note"]) &&
    typeof value["done"] === "boolean" &&
    typeof value["createdAt"] === "number" &&
    typeof value["updatedAt"] === "number"
  );
}

function normalizeCategory(category: TimeTrackerCategory): TimeTrackerCategory {
  const defaultCategory = DEFAULT_TIME_TRACKER_CATEGORIES.find((item) => item.id === category.id);
  return {
    ...category,
    subs: category.subs.map((sub) => {
      const defaultSub = defaultCategory?.subs.find((item) => item.id === sub.id);
      return {
        ...sub,
        color: sub.color ?? defaultSub?.color ?? category.color,
        icon: sub.icon ?? defaultSub?.icon ?? category.icon,
      };
    }),
  };
}

function safeParse(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  return safeParse(window.localStorage.getItem(key));
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(TIME_TRACKER_STORAGE_EVENT, { detail: { key } }));
}

export function readTimeTrackerCategories(): TimeTrackerCategory[] {
  const raw = readJson(TIME_TRACKER_CATEGORIES_KEY);
  if (!Array.isArray(raw)) return [...DEFAULT_TIME_TRACKER_CATEGORIES];
  const categories = raw.filter(isCategory).filter((category) => category.deleted !== true).map(normalizeCategory);
  return categories.length > 0 ? categories : [...DEFAULT_TIME_TRACKER_CATEGORIES];
}

export function readTimeTrackerEntries(): TimeTrackerEntry[] {
  const raw = readJson(TIME_TRACKER_ENTRIES_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isEntry).filter((entry) => entry.deleted !== true);
}

export function readTimeTrackerMode(): TimeTrackerMode {
  if (typeof window === "undefined") return "single";
  return window.localStorage.getItem(TIME_TRACKER_MODE_KEY) === "multi" ? "multi" : "single";
}

export function writeTimeTrackerCategories(categories: readonly TimeTrackerCategory[]): void {
  writeJson(TIME_TRACKER_CATEGORIES_KEY, categories);
}

export function writeTimeTrackerEntries(entries: readonly TimeTrackerEntry[]): void {
  writeJson(TIME_TRACKER_ENTRIES_KEY, entries);
}

export function writeTimeTrackerMode(mode: TimeTrackerMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TIME_TRACKER_MODE_KEY, mode);
  window.dispatchEvent(new CustomEvent(TIME_TRACKER_STORAGE_EVENT, { detail: { key: TIME_TRACKER_MODE_KEY } }));
}

export function createTimeTrackerEntry(
  categoryId: string,
  subId: string | null,
  startMs: number,
  endMs: number | null,
  note: LocalizedText,
): TimeTrackerEntry {
  const stamp = Date.now();
  return {
    id: `tt_${stamp.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    categoryId,
    subId,
    segments: [{ start: startMs, end: endMs }],
    note,
    done: endMs !== null,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function finishTimeTrackerEntry(entry: TimeTrackerEntry, atMs: number): TimeTrackerEntry {
  const segments = entry.segments.map((segment, index) => {
    if (index !== entry.segments.length - 1 || segment.end !== null) return segment;
    return { ...segment, end: atMs };
  });
  return { ...entry, segments, done: true, updatedAt: atMs };
}

export function pauseTimeTrackerEntry(entry: TimeTrackerEntry, atMs: number): TimeTrackerEntry {
  const segments = entry.segments.map((segment, index) => {
    if (index !== entry.segments.length - 1 || segment.end !== null) return segment;
    return { ...segment, end: atMs };
  });
  return { ...entry, segments, updatedAt: atMs };
}

export function resumeTimeTrackerEntry(entry: TimeTrackerEntry, atMs: number): TimeTrackerEntry {
  return { ...entry, segments: [...entry.segments, { start: atMs, end: null }], updatedAt: atMs };
}

export function deleteTimeTrackerEntry(entry: TimeTrackerEntry, atMs: number): TimeTrackerEntry {
  return { ...entry, deleted: true, updatedAt: atMs };
}

export function getTimeTrackerSnapshot(nowMs = Date.now()): TimeTrackerSnapshot {
  const categories = readTimeTrackerCategories();
  const entries = readTimeTrackerEntries();
  const todayStart = startOfDay(nowMs);
  const weekStart = startOfWeek(nowMs);
  const todayEntries = entries.filter((entry) => entryStart(entry) >= todayStart);
  const weekEntries = entries.filter((entry) => entryStart(entry) >= weekStart);
  const activeEntries = entries.filter(isRunningEntry);
  const byCategory = new Map<string, number>();
  for (const entry of todayEntries) {
    byCategory.set(entry.categoryId, (byCategory.get(entry.categoryId) ?? 0) + entryDuration(entry, nowMs));
  }
  const topCategoryId = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topCategory = topCategoryId === null ? null : categories.find((category) => category.id === topCategoryId) ?? null;
  return {
    todayTotalMs: todayEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0),
    weekTotalMs: weekEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0),
    runningCount: activeEntries.length,
    activeTotalMs: activeEntries.reduce((total, entry) => total + entryDuration(entry, nowMs), 0),
    entriesToday: todayEntries.length,
    topCategoryName: topCategory?.name ?? null,
  };
}

export function useTimeTrackerStorage<T>(read: () => T, write: (value: T) => void): readonly [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(read);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    function refresh(): void {
      const nextValue = read();
      valueRef.current = nextValue;
      setValue(nextValue);
    }
    window.addEventListener("storage", refresh);
    window.addEventListener(TIME_TRACKER_STORAGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(TIME_TRACKER_STORAGE_EVENT, refresh);
    };
  }, [read]);

  const setStored = useCallback(
    (next: T | ((prev: T) => T)) => {
      const nextValue = typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;
      valueRef.current = nextValue;
      write(nextValue);
      setValue(nextValue);
    },
    [write],
  );

  return [value, setStored] as const;
}

export function useTimeTrackerCategories(): readonly [TimeTrackerCategory[], (next: TimeTrackerCategory[] | ((prev: TimeTrackerCategory[]) => TimeTrackerCategory[])) => void] {
  return useTimeTrackerStorage(readTimeTrackerCategories, writeTimeTrackerCategories);
}

export function useTimeTrackerEntries(): readonly [TimeTrackerEntry[], (next: TimeTrackerEntry[] | ((prev: TimeTrackerEntry[]) => TimeTrackerEntry[])) => void] {
  return useTimeTrackerStorage(readTimeTrackerEntries, writeTimeTrackerEntries);
}

export function useTimeTrackerMode(): readonly [TimeTrackerMode, (next: TimeTrackerMode | ((prev: TimeTrackerMode) => TimeTrackerMode)) => void] {
  const read = useCallback(readTimeTrackerMode, []);
  const write = useCallback(writeTimeTrackerMode, []);
  return useTimeTrackerStorage(read, write);
}

export function useCategoryMap(categories: readonly TimeTrackerCategory[]): ReadonlyMap<string, TimeTrackerCategory> {
  return useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
}
