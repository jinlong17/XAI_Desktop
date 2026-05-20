import { useCallback, useEffect, useMemo, useState } from "react";
import { LocalStorageAdapter } from "../data/LocalStorageAdapter";
import { useWidgetRepoAdapter } from "../data/RepoProvider";
import type {
  WidgetDensity,
  WidgetEntity,
  WidgetPreferences,
  WidgetSize,
} from "../types";

const WIDGET_STORAGE_KEY = "xai.widgets.v1";
const PREF_STORAGE_KEY = "xai.widget-preferences.v1";
const EMPTY_SEED_WIDGETS: WidgetEntity[] = [];

export interface WidgetStoreState {
  widgets: WidgetEntity[];
  preferences: WidgetPreferences;
  addWidget(type: string, size: WidgetSize, config?: Record<string, unknown>): Promise<void>;
  updateWidget(id: string, patch: Partial<Pick<WidgetEntity, "position" | "size" | "config" | "visible">>): Promise<void>;
  removeWidget(id: string): Promise<void>;
  setDensity(density: WidgetDensity): Promise<void>;
  setWallpaperTone(tone: WidgetPreferences["wallpaperTone"]): Promise<void>;
}

const defaultPreferences: WidgetPreferences = {
  density: "comfortable",
  theme: "system",
  wallpaperTone: "mixed",
  contrast: "standard",
};

function nowIso(): string {
  return new Date().toISOString();
}

function createWidget(type: string, size: WidgetSize, config: Record<string, unknown>): WidgetEntity {
  const timestamp = nowIso();
  // SSR / non-secure context fallback only; crypto.randomUUID is preferred.
  const fallbackId = `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}-${Math.random().toString(36).slice(2)}`;
  return {
    id: `widget-${type}-${globalThis.crypto?.randomUUID?.() ?? fallbackId}`,
    entityType: "widgets.widget",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "device-local",
    type,
    position: { x: 24, y: 24 },
    size,
    config,
    visible: true,
    version: 1,
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

// seedWidgets is strictly a fallback when localStorage is empty.
export function useWidgetStore(seedWidgets: WidgetEntity[] = EMPTY_SEED_WIDGETS): WidgetStoreState {
  const repoAdapter = useWidgetRepoAdapter();
  const fallbackAdapter = useMemo(() => new LocalStorageAdapter<WidgetEntity>(WIDGET_STORAGE_KEY, seedWidgets), [seedWidgets]);
  const adapter = repoAdapter ?? fallbackAdapter;
  const [widgets, setWidgets] = useState<WidgetEntity[]>([]);
  const [preferences, setPreferences] = useState<WidgetPreferences>(defaultPreferences);

  const persistWidgets = useCallback((next: WidgetEntity[]) => {
    setWidgets(next);
  }, []);

  const refreshFromAdapter = useCallback(async () => {
    const next = await adapter.getAll();
    persistWidgets(next);
  }, [adapter, persistWidgets]);

  useEffect(() => {
    const storedPrefs = readJson<WidgetPreferences>(PREF_STORAGE_KEY, defaultPreferences);
    setPreferences(storedPrefs);
    void refreshFromAdapter();
  }, [refreshFromAdapter]);

  return {
    widgets,
    preferences,
    async addWidget(type, size, config = {}) {
      await adapter.save(createWidget(type, size, config));
      await refreshFromAdapter();
    },
    async updateWidget(id, patch) {
      const existing = await adapter.getById(id);
      if (!existing) {
        return;
      }
      await adapter.save({ ...existing, ...patch, updatedAt: nowIso(), version: existing.version + 1 });
      await refreshFromAdapter();
    },
    async removeWidget(id) {
      await adapter.delete(id);
      await refreshFromAdapter();
    },
    async setDensity(density) {
      const next = { ...preferences, density };
      setPreferences(next);
      writeJson(PREF_STORAGE_KEY, next);
    },
    async setWallpaperTone(tone) {
      const next: WidgetPreferences = {
        ...preferences,
        wallpaperTone: tone,
        contrast: tone === "mixed" || tone === "dark" ? "high" : "standard",
      };
      setPreferences(next);
      writeJson(PREF_STORAGE_KEY, next);
    },
  };
}

export function createSeedWidget(type: string, size: WidgetSize, config: Record<string, unknown> = {}): WidgetEntity {
  return createWidget(type, size, config);
}
