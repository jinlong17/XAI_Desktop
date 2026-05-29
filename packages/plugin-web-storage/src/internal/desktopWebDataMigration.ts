import {
  DESKTOP_WEB_IMPORT_SURFACES,
  createDesktopWebImportFingerprint,
  normalizeImportBoundaryKey,
  type DesktopWebImportSurface,
  type DesktopWebImportSurfaceResult,
  type DesktopWebImportTrigger,
} from "@repo/core-data";

import { PREF_REGISTRY, type PrefCodec } from "./registry.js";

const TASKS_STORAGE_KEY = "xai_task_cols" as const;
const HABITS_STORAGE_KEY = "xai_habits_state" as const;
const POMODORO_STORAGE_KEY = "xai_pomodoro_sessions" as const;
const BOARDS_STORAGE_KEY = "xai_boards_v2" as const;

const BOARD_AUX_KEYS = [
  "xai_active_board",
  "xai_board_panels",
  "xai_board_inbox",
  "xai_board_view_by_id",
] as const;

const PET_KEYS = ["xai_pet_id", "xai_pet_pos"] as const;

const SKIPPED_INDEXED_DB_STORES = [
  "web-encrypted-cache",
  "xai-web-ai-secrets",
  "xai-web-auth",
] as const;

type IndexedDbSkipReport = {
  name: string;
  reason: "browser_owned_store";
};

export interface DesktopWebImportReport {
  runId: string;
  trigger: DesktopWebImportTrigger;
  boundaryKey: string;
  wrote: boolean;
  results: DesktopWebImportSurfaceResult[];
  skippedIndexedDbStores: IndexedDbSkipReport[];
  counts: {
    imported: number;
    unchanged: number;
    empty: number;
    skipped: number;
    corrupt: number;
    failed: number;
  };
}

type LocalStorageRead = {
  present: boolean;
  corrupt: boolean;
  value: unknown;
};

let desktopImportRuntimeEnabled = false;
let lastDesktopWebImportReport: DesktopWebImportReport | null = null;

export function setDesktopWebImportRuntimeEnabled(enabled: boolean): void {
  desktopImportRuntimeEnabled = enabled;
}

export function getLastDesktopWebImportReport(): DesktopWebImportReport | null {
  return lastDesktopWebImportReport;
}

export function scanDesktopWebImportEligibility(input?: {
  boundaryKey?: string;
  surfaces?: readonly DesktopWebImportSurface[];
  trigger?: DesktopWebImportTrigger;
}): DesktopWebImportReport {
  const trigger = input?.trigger ?? "first-run-scan";
  const boundaryKey = normalizeImportBoundaryKey(input?.boundaryKey);
  const runId = createRunId(trigger);
  const targetSurfaces =
    input?.surfaces && input.surfaces.length > 0
      ? input.surfaces
      : DESKTOP_WEB_IMPORT_SURFACES;

  const results: DesktopWebImportSurfaceResult[] = [];

  if (!desktopImportRuntimeEnabled || typeof window === "undefined") {
    for (const surface of targetSurfaces) {
      results.push({
        surface,
        status: "skipped",
        skippedReason: "unsupported_surface",
        message: "desktop runtime is not active",
      });
    }
    const report = createReport({
      runId,
      trigger,
      boundaryKey,
      wrote: false,
      results,
      skippedIndexedDbStores: buildIndexedDbSkipReport(),
    });
    lastDesktopWebImportReport = report;
    return report;
  }

  for (const surface of targetSurfaces) {
    const probe = probeSurface(surface);

    if (probe.corrupt) {
      results.push({
        surface,
        status: "corrupt",
        message: probe.message,
      });
      continue;
    }

    if (!probe.hasMaterialValue) {
      results.push({
        surface,
        status: "empty",
        sourceFingerprint: createDesktopWebImportFingerprint(probe.fingerprintSource),
        unchangedCount: 0,
      });
      continue;
    }

    results.push({
      surface,
      status: "unchanged",
      sourceFingerprint: createDesktopWebImportFingerprint(probe.fingerprintSource),
      unchangedCount: probe.count,
      message: "eligible",
    });
  }

  const report = createReport({
    runId,
    trigger,
    boundaryKey,
    wrote: false,
    results,
    skippedIndexedDbStores: buildIndexedDbSkipReport(),
  });
  lastDesktopWebImportReport = report;
  return report;
}

export function __resetDesktopWebImportStateForTests(): void {
  desktopImportRuntimeEnabled = false;
  lastDesktopWebImportReport = null;
}

function buildIndexedDbSkipReport(): IndexedDbSkipReport[] {
  return SKIPPED_INDEXED_DB_STORES.map((name) => ({
    name,
    reason: "browser_owned_store",
  }));
}

function createReport(input: {
  runId: string;
  trigger: DesktopWebImportTrigger;
  boundaryKey: string;
  wrote: boolean;
  results: DesktopWebImportSurfaceResult[];
  skippedIndexedDbStores: IndexedDbSkipReport[];
}): DesktopWebImportReport {
  const counts = {
    imported: 0,
    unchanged: 0,
    empty: 0,
    skipped: 0,
    corrupt: 0,
    failed: 0,
  };

  for (const result of input.results) {
    counts[result.status] += 1;
  }

  return {
    runId: input.runId,
    trigger: input.trigger,
    boundaryKey: input.boundaryKey,
    wrote: input.wrote,
    results: input.results,
    skippedIndexedDbStores: input.skippedIndexedDbStores,
    counts,
  };
}

function createRunId(trigger: DesktopWebImportTrigger): string {
  const stamp = Date.now().toString(36);
  return `${trigger}:${stamp}`;
}

function probeSurface(surface: DesktopWebImportSurface): {
  corrupt: boolean;
  hasMaterialValue: boolean;
  count: number;
  fingerprintSource: unknown;
  message?: string;
} {
  switch (surface) {
    case "tasks": {
      const read = readKnownKey(TASKS_STORAGE_KEY);
      if (read.corrupt) {
        return {
          corrupt: true,
          hasMaterialValue: false,
          count: 0,
          fingerprintSource: [],
          message: `${TASKS_STORAGE_KEY} is unreadable`,
        };
      }
      const arrayValue = Array.isArray(read.value) ? read.value : [];
      return {
        corrupt: false,
        hasMaterialValue: arrayValue.length > 0,
        count: arrayValue.length,
        fingerprintSource: arrayValue,
      };
    }

    case "habits": {
      const read = readKnownKey(HABITS_STORAGE_KEY);
      if (read.corrupt) {
        return {
          corrupt: true,
          hasMaterialValue: false,
          count: 0,
          fingerprintSource: {},
          message: `${HABITS_STORAGE_KEY} is unreadable`,
        };
      }
      const root = isObject(read.value) ? read.value : {};
      const habits = Array.isArray(root.habits) ? root.habits : [];
      return {
        corrupt: false,
        hasMaterialValue: habits.length > 0,
        count: habits.length,
        fingerprintSource: root,
      };
    }

    case "pomodoro": {
      const read = readKnownKey(POMODORO_STORAGE_KEY);
      if (read.corrupt) {
        return {
          corrupt: true,
          hasMaterialValue: false,
          count: 0,
          fingerprintSource: [],
          message: `${POMODORO_STORAGE_KEY} is unreadable`,
        };
      }
      const sessions = Array.isArray(read.value) ? read.value : [];
      return {
        corrupt: false,
        hasMaterialValue: sessions.length > 0,
        count: sessions.length,
        fingerprintSource: sessions,
      };
    }

    case "boards": {
      const read = readKnownKey(BOARDS_STORAGE_KEY);
      if (read.corrupt) {
        return {
          corrupt: true,
          hasMaterialValue: false,
          count: 0,
          fingerprintSource: [],
          message: `${BOARDS_STORAGE_KEY} is unreadable`,
        };
      }
      const boards = Array.isArray(read.value) ? read.value : [];
      return {
        corrupt: false,
        hasMaterialValue: boards.length > 0,
        count: boards.length,
        fingerprintSource: boards,
      };
    }

    case "board-workspace": {
      const read = readGroup(BOARD_AUX_KEYS);
      if (read.corrupt) {
        return {
          corrupt: true,
          hasMaterialValue: false,
          count: 0,
          fingerprintSource: {},
          message: "board workspace state is unreadable",
        };
      }
      const keys = Object.keys(read.value);
      return {
        corrupt: false,
        hasMaterialValue: keys.length > 0,
        count: keys.length,
        fingerprintSource: read.value,
      };
    }

    case "pet": {
      const read = readGroup(PET_KEYS);
      if (read.corrupt) {
        return {
          corrupt: true,
          hasMaterialValue: false,
          count: 0,
          fingerprintSource: {},
          message: "pet state is unreadable",
        };
      }
      const keys = Object.keys(read.value);
      return {
        corrupt: false,
        hasMaterialValue: keys.length > 0,
        count: keys.length,
        fingerprintSource: read.value,
      };
    }

    case "settings": {
      const read = readSettingsSurface();
      if (read.corrupt) {
        return {
          corrupt: true,
          hasMaterialValue: false,
          count: 0,
          fingerprintSource: {},
          message: "settings source has unreadable xai_pref_* values",
        };
      }
      const keys = Object.keys(read.value);
      return {
        corrupt: false,
        hasMaterialValue: keys.length > 0,
        count: keys.length,
        fingerprintSource: read.value,
      };
    }
  }
}

function readGroup(keys: readonly string[]): { value: Record<string, unknown>; corrupt: boolean } {
  const value: Record<string, unknown> = {};
  for (const key of keys) {
    const read = readKnownKey(key);
    if (read.corrupt) {
      return { value: {}, corrupt: true };
    }
    if (!read.present) {
      continue;
    }
    value[key] = read.value;
  }
  return { value, corrupt: false };
}

function readSettingsSurface(): { value: Record<string, unknown>; corrupt: boolean } {
  const value: Record<string, unknown> = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith("xai_pref_")) {
      continue;
    }

    const raw = readRawLocalStorageValue(key);
    if (raw === null) {
      continue;
    }

    const decoded = decodeUnknownPrefRaw(raw);
    if (!decoded.ok) {
      return { value: {}, corrupt: true };
    }

    value[key] = decoded.value;
  }

  return { value, corrupt: false };
}

function readKnownKey(key: string): LocalStorageRead {
  const entry = PREF_REGISTRY[key as keyof typeof PREF_REGISTRY];
  const codec: PrefCodec = entry?.codec ?? inferCodecForKnownKey(key);
  const raw = readRawLocalStorageValue(key);

  if (raw === null) {
    return {
      present: false,
      corrupt: false,
      value: defaultValueForCodec(codec),
    };
  }

  if (codec === "json") {
    try {
      return {
        present: true,
        corrupt: false,
        value: JSON.parse(raw),
      };
    } catch {
      return {
        present: true,
        corrupt: true,
        value: null,
      };
    }
  }

  if (codec === "boolean") {
    if (raw === "true" || raw === "false") {
      return {
        present: true,
        corrupt: false,
        value: raw === "true",
      };
    }
    return {
      present: true,
      corrupt: true,
      value: null,
    };
  }

  if (codec === "number") {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      return {
        present: true,
        corrupt: false,
        value: parsed,
      };
    }
    return {
      present: true,
      corrupt: true,
      value: null,
    };
  }

  return {
    present: true,
    corrupt: false,
    value: raw,
  };
}

function readRawLocalStorageValue(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function inferCodecForKnownKey(key: string): PrefCodec {
  if (key === "xai_active_board" || key === "xai_pet_id") {
    return "string";
  }
  return "json";
}

function defaultValueForCodec(codec: PrefCodec): unknown {
  if (codec === "json") {
    return null;
  }
  if (codec === "boolean") {
    return false;
  }
  if (codec === "number") {
    return 0;
  }
  return "";
}

function decodeUnknownPrefRaw(raw: string):
  | { ok: true; value: unknown }
  | { ok: false } {
  const trimmed = raw.trim();

  if (trimmed === "true") {
    return { ok: true, value: true };
  }
  if (trimmed === "false") {
    return { ok: true, value: false };
  }

  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(trimmed)) {
    return { ok: true, value: Number(trimmed) };
  }

  const looksLikeJson =
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed.startsWith('"') ||
    trimmed === "null";

  if (looksLikeJson) {
    try {
      return { ok: true, value: JSON.parse(trimmed) };
    } catch {
      return { ok: false };
    }
  }

  return { ok: true, value: raw };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
