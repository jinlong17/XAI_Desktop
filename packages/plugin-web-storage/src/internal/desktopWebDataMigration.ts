import {
  buildDesktopWebImportLedgerId,
  buildDesktopWebImportRunRecordId,
  createDesktopWebImportFingerprint,
  createTauriRepo,
  DESKTOP_WEB_IMPORT_SURFACES,
  normalizeImportBoundaryKey,
  type DesktopWebImportLedgerRecord,
  type DesktopWebImportRunRecord,
  type DesktopWebImportSurface,
  type DesktopWebImportSurfaceResult,
  type DesktopWebImportTrigger,
  type Repo,
  type RepoRecord,
  type RepoTransaction,
} from "@repo/core-data";

import {
  BOARD_AUX_KEYS,
  BOARDS_STORAGE_KEY,
  DESKTOP_REPO_NAMESPACE,
  HABITS_STORAGE_KEY,
  PET_KEYS,
  POMODORO_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  buildBoardEntities,
  buildCardEntities,
  buildHabitEntities,
  buildTodoEntities,
  isSingleRecordBridgedKey,
  toBridgeRecord,
} from "./desktopRepoBridge.js";
import { PREF_REGISTRY, type PrefCodec } from "./registry.js";

const IMPORT_LEDGER_NAMESPACE = "xai-web-desktop-local-first-import";
const IMPORT_LEDGER_SCHEMA_VERSION = 1;

const SKIPPED_INDEXED_DB_STORES = [
  "web-encrypted-cache",
  "xai-web-ai-secrets",
  "xai-web-auth",
] as const;

type IndexedDbSkipReport = {
  name: string;
  reason: "browser_owned_store";
};

type ImportCounts = {
  imported: number;
  unchanged: number;
  empty: number;
  skipped: number;
  corrupt: number;
  failed: number;
};

export interface DesktopWebImportReport {
  runId: string;
  trigger: DesktopWebImportTrigger;
  boundaryKey: string;
  wrote: boolean;
  boundaryConflict: boolean;
  results: DesktopWebImportSurfaceResult[];
  skippedIndexedDbStores: IndexedDbSkipReport[];
  counts: ImportCounts;
}

type LocalStorageRead = {
  present: boolean;
  corrupt: boolean;
  value: unknown;
};

type PreparedSurface = {
  surface: DesktopWebImportSurface;
  corrupt: boolean;
  message?: string;
  hasMaterialValue: boolean;
  fingerprintSource: unknown;
  nextRecords: RepoRecord[];
};

let desktopImportRuntimeEnabled = false;
let lastDesktopWebImportReport: DesktopWebImportReport | null = null;

export function setDesktopWebImportRuntimeEnabled(enabled: boolean): void {
  desktopImportRuntimeEnabled = enabled;
}

export function getLastDesktopWebImportReport(): DesktopWebImportReport | null {
  return lastDesktopWebImportReport;
}

export async function scanDesktopWebImportEligibility(input?: {
  boundaryKey?: string;
  surfaces?: readonly DesktopWebImportSurface[];
  trigger?: DesktopWebImportTrigger;
}): Promise<DesktopWebImportReport> {
  return executeDesktopWebImport({
    trigger: input?.trigger ?? "first-run-scan",
    boundaryKey: input?.boundaryKey,
    surfaces: input?.surfaces,
    dryRun: true,
    allowBoundaryOverride: false,
  });
}

export async function runDesktopWebDataImport(input?: {
  boundaryKey?: string;
  surfaces?: readonly DesktopWebImportSurface[];
  allowBoundaryOverride?: boolean;
}): Promise<DesktopWebImportReport> {
  return executeDesktopWebImport({
    trigger: "explicit-import",
    boundaryKey: input?.boundaryKey,
    surfaces: input?.surfaces,
    dryRun: false,
    allowBoundaryOverride: input?.allowBoundaryOverride ?? false,
  });
}

export function __resetDesktopWebImportStateForTests(): void {
  desktopImportRuntimeEnabled = false;
  lastDesktopWebImportReport = null;
}

async function executeDesktopWebImport(input: {
  trigger: DesktopWebImportTrigger;
  boundaryKey?: string;
  surfaces?: readonly DesktopWebImportSurface[];
  dryRun: boolean;
  allowBoundaryOverride: boolean;
}): Promise<DesktopWebImportReport> {
  const boundaryKey = normalizeImportBoundaryKey(input.boundaryKey);
  const runId = createRunId(input.trigger);
  const targetSurfaces =
    input.surfaces && input.surfaces.length > 0
      ? input.surfaces
      : DESKTOP_WEB_IMPORT_SURFACES;

  const skippedIndexedDbStores = buildIndexedDbSkipReport();

  if (!desktopImportRuntimeEnabled || typeof window === "undefined") {
    const results = targetSurfaces.map((surface) => ({
      surface,
      status: "skipped" as const,
      skippedReason: "unsupported_surface" as const,
      message: "desktop runtime is not active",
    }));

    const report = createReport({
      runId,
      trigger: input.trigger,
      boundaryKey,
      wrote: false,
      boundaryConflict: false,
      results,
      skippedIndexedDbStores,
    });
    lastDesktopWebImportReport = report;
    return report;
  }

  const prepared = targetSurfaces.map((surface) => prepareSurface(surface));

  const repos = createReposFromTauri();
  const boundaryConflict = await detectBoundaryConflict(
    repos?.importRepo ?? null,
    boundaryKey,
    targetSurfaces,
  );

  const results: DesktopWebImportSurfaceResult[] = [];
  let wrote = false;

  for (const entry of prepared) {
    if (entry.corrupt) {
      results.push({
        surface: entry.surface,
        status: "corrupt",
        message: entry.message,
      });
      continue;
    }

    if (input.dryRun) {
      results.push({
        surface: entry.surface,
        status: entry.hasMaterialValue ? "unchanged" : "empty",
        sourceFingerprint: createDesktopWebImportFingerprint(entry.fingerprintSource),
        unchangedCount: entry.hasMaterialValue ? entry.nextRecords.length : 0,
        message: boundaryConflict
          ? "boundary conflict detected; explicit import requires override"
          : entry.hasMaterialValue
            ? "eligible"
            : undefined,
      });
      continue;
    }

    if (!repos) {
      results.push({
        surface: entry.surface,
        status: "failed",
        message: "desktop repository bridge is unavailable",
      });
      continue;
    }

    if (boundaryConflict && !input.allowBoundaryOverride) {
      results.push({
        surface: entry.surface,
        status: "skipped",
        skippedReason: "boundary_conflict",
        message:
          "existing import ledger belongs to a different boundary key; set override to continue",
      });
      continue;
    }

    const result = await reconcileSurface({
      bridgeRepo: repos.bridgeRepo,
      importRepo: repos.importRepo,
      surface: entry.surface,
      boundaryKey,
      fingerprintSource: entry.fingerprintSource,
      nextRecords: entry.nextRecords,
    });

    results.push(result);
    if (
      result.status === "imported" &&
      ((result.importedCount ?? 0) > 0 || (result.deletedCount ?? 0) > 0)
    ) {
      wrote = true;
    }
  }

  const report = createReport({
    runId,
    trigger: input.trigger,
    boundaryKey,
    wrote,
    boundaryConflict,
    results,
    skippedIndexedDbStores,
  });

  if (!input.dryRun && repos) {
    await persistRunReport(repos.importRepo, report);
  }

  lastDesktopWebImportReport = report;
  return report;
}

async function reconcileSurface(input: {
  bridgeRepo: Repo<RepoRecord>;
  importRepo: Repo<RepoRecord>;
  surface: DesktopWebImportSurface;
  boundaryKey: string;
  fingerprintSource: unknown;
  nextRecords: RepoRecord[];
}): Promise<DesktopWebImportSurfaceResult> {
  const nowIso = new Date().toISOString();
  const sourceFingerprint = createDesktopWebImportFingerprint(input.fingerprintSource);
  const ledgerId = buildDesktopWebImportLedgerId(input.boundaryKey, input.surface);

  const previous = (await input.importRepo.get(ledgerId)) as
    | DesktopWebImportLedgerRecord
    | undefined;

  if (previous?.sourceFingerprint === sourceFingerprint) {
    return {
      surface: input.surface,
      status: "unchanged",
      sourceFingerprint,
      unchangedCount: input.nextRecords.length,
    };
  }

  const previousIds = new Set(previous?.importedRecordIds ?? []);
  const nextIds = new Set(input.nextRecords.map((record) => record.id));

  const { importedCount, deletedCount } = await input.bridgeRepo.transaction(
    async (tx) =>
      applySurfaceReconcile({
        tx,
        nowIso,
        nextRecords: input.nextRecords,
        previousIds,
        nextIds,
      }),
  );

  const status =
    importedCount === 0 && deletedCount === 0 && input.nextRecords.length === 0
      ? "empty"
      : "imported";

  const ledgerRecord: DesktopWebImportLedgerRecord = {
    id: ledgerId,
    entityType: "desktop.web_import_ledger",
    schemaVersion: IMPORT_LEDGER_SCHEMA_VERSION,
    createdAt: previous?.createdAt ?? nowIso,
    updatedAt: nowIso,
    syncScope: "device-local",
    surface: input.surface,
    boundaryKey: input.boundaryKey,
    sourceFingerprint,
    importedRecordIds: [...nextIds],
    lastStatus: status,
    lastRunAt: nowIso,
  };

  await input.importRepo.put(ledgerRecord);

  return {
    surface: input.surface,
    status,
    sourceFingerprint,
    importedCount,
    deletedCount,
    unchangedCount: 0,
  };
}

async function applySurfaceReconcile(input: {
  tx: RepoTransaction<RepoRecord>;
  nowIso: string;
  nextRecords: RepoRecord[];
  previousIds: Set<string>;
  nextIds: Set<string>;
}): Promise<{ importedCount: number; deletedCount: number }> {
  let importedCount = 0;
  let deletedCount = 0;

  for (const nextRecord of input.nextRecords) {
    const existing = await input.tx.get(nextRecord.id);
    const merged: RepoRecord = {
      ...nextRecord,
      createdAt: existing?.createdAt ?? nextRecord.createdAt ?? input.nowIso,
      updatedAt: input.nowIso,
    };
    await input.tx.put(merged);
    importedCount += 1;
  }

  for (const staleId of input.previousIds) {
    if (!input.nextIds.has(staleId)) {
      await input.tx.delete(staleId);
      deletedCount += 1;
    }
  }

  return { importedCount, deletedCount };
}

function prepareSurface(surface: DesktopWebImportSurface): PreparedSurface {
  switch (surface) {
    case "tasks": {
      const read = readKnownKey(TASKS_STORAGE_KEY);
      if (read.corrupt) {
        return corruptedSurface(surface, `${TASKS_STORAGE_KEY} is unreadable`);
      }
      const value = Array.isArray(read.value) ? read.value : [];
      const records = buildTodoEntities(value);
      return {
        surface,
        corrupt: false,
        hasMaterialValue: records.length > 0,
        fingerprintSource: value,
        nextRecords: records,
      };
    }

    case "habits": {
      const read = readKnownKey(HABITS_STORAGE_KEY);
      if (read.corrupt) {
        return corruptedSurface(surface, `${HABITS_STORAGE_KEY} is unreadable`);
      }
      const value = isObject(read.value) ? read.value : {};
      const records = buildHabitEntities(value);
      return {
        surface,
        corrupt: false,
        hasMaterialValue: records.length > 0,
        fingerprintSource: value,
        nextRecords: records,
      };
    }

    case "pomodoro": {
      const read = readKnownKey(POMODORO_STORAGE_KEY);
      if (read.corrupt) {
        return corruptedSurface(surface, `${POMODORO_STORAGE_KEY} is unreadable`);
      }
      const sessions = Array.isArray(read.value) ? read.value : [];
      const records = buildSingleRecordSurfaceRecords({
        storageValues: {
          [POMODORO_STORAGE_KEY]: sessions,
        },
      });
      return {
        surface,
        corrupt: false,
        hasMaterialValue: sessions.length > 0,
        fingerprintSource: sessions,
        nextRecords: records,
      };
    }

    case "boards": {
      const read = readKnownKey(BOARDS_STORAGE_KEY);
      if (read.corrupt) {
        return corruptedSurface(surface, `${BOARDS_STORAGE_KEY} is unreadable`);
      }
      const boards = Array.isArray(read.value) ? read.value : [];
      const records = [...buildBoardEntities(boards), ...buildCardEntities(boards)];
      return {
        surface,
        corrupt: false,
        hasMaterialValue: records.length > 0,
        fingerprintSource: boards,
        nextRecords: records,
      };
    }

    case "board-workspace": {
      const group = readGroup(BOARD_AUX_KEYS);
      if (group.corrupt) {
        return corruptedSurface(surface, "board workspace state is unreadable");
      }
      const records = buildSingleRecordSurfaceRecords({
        storageValues: group.values,
      });
      return {
        surface,
        corrupt: false,
        hasMaterialValue: Object.keys(group.values).length > 0,
        fingerprintSource: group.values,
        nextRecords: records,
      };
    }

    case "pet": {
      const group = readGroup(PET_KEYS);
      if (group.corrupt) {
        return corruptedSurface(surface, "pet state is unreadable");
      }
      const records = buildSingleRecordSurfaceRecords({
        storageValues: group.values,
      });
      return {
        surface,
        corrupt: false,
        hasMaterialValue: Object.keys(group.values).length > 0,
        fingerprintSource: group.values,
        nextRecords: records,
      };
    }

    case "settings": {
      const settings = readSettingsSurface();
      if (settings.corrupt) {
        return corruptedSurface(
          surface,
          "settings source has unreadable xai_pref_* values",
        );
      }
      const records = buildSingleRecordSurfaceRecords({
        storageValues: settings.values,
      });
      return {
        surface,
        corrupt: false,
        hasMaterialValue: Object.keys(settings.values).length > 0,
        fingerprintSource: settings.values,
        nextRecords: records,
      };
    }
  }
}

function corruptedSurface(
  surface: DesktopWebImportSurface,
  message: string,
): PreparedSurface {
  return {
    surface,
    corrupt: true,
    message,
    hasMaterialValue: false,
    fingerprintSource: null,
    nextRecords: [],
  };
}

function buildSingleRecordSurfaceRecords(input: {
  storageValues: Record<string, unknown>;
}): RepoRecord[] {
  const nowIso = new Date().toISOString();
  const records: RepoRecord[] = [];

  for (const [storageKey, value] of Object.entries(input.storageValues)) {
    if (!isSingleRecordBridgedKey(storageKey)) {
      continue;
    }

    const record = toBridgeRecord(storageKey, value, {
      id: storageKey,
      schemaVersion: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
      syncScope: "device-local",
    });

    records.push(record as RepoRecord);
  }

  return records;
}

function readGroup(keys: Iterable<string>): {
  values: Record<string, unknown>;
  corrupt: boolean;
} {
  const values: Record<string, unknown> = {};
  for (const key of keys) {
    const read = readKnownKey(key);
    if (read.corrupt) {
      return { values: {}, corrupt: true };
    }
    if (!read.present) {
      continue;
    }
    values[key] = read.value;
  }
  return { values, corrupt: false };
}

function readSettingsSurface(): {
  values: Record<string, unknown>;
  corrupt: boolean;
} {
  const values: Record<string, unknown> = {};

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
      return { values: {}, corrupt: true };
    }

    values[key] = decoded.value;
  }

  return { values, corrupt: false };
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

async function detectBoundaryConflict(
  importRepo: Repo<RepoRecord> | null,
  boundaryKey: string,
  surfaces: readonly DesktopWebImportSurface[],
): Promise<boolean> {
  if (!importRepo) {
    return false;
  }

  const rows = (await importRepo.list({
    entityType: "desktop.web_import_ledger",
  })) as DesktopWebImportLedgerRecord[];

  const target = new Set(surfaces);
  for (const row of rows) {
    if (!target.has(row.surface)) {
      continue;
    }
    if (row.boundaryKey !== boundaryKey && row.importedRecordIds.length > 0) {
      return true;
    }
  }

  return false;
}

async function persistRunReport(
  importRepo: Repo<RepoRecord>,
  report: DesktopWebImportReport,
): Promise<void> {
  const nowIso = new Date().toISOString();
  const runRecordId = buildDesktopWebImportRunRecordId(report.runId);

  const existing = (await importRepo.get(runRecordId)) as
    | DesktopWebImportRunRecord
    | undefined;

  const runRecord: DesktopWebImportRunRecord = {
    id: runRecordId,
    entityType: "desktop.web_import_run",
    schemaVersion: IMPORT_LEDGER_SCHEMA_VERSION,
    createdAt: existing?.createdAt ?? nowIso,
    updatedAt: nowIso,
    syncScope: "device-local",
    runId: report.runId,
    trigger: report.trigger,
    boundaryKey: report.boundaryKey,
    wrote: report.wrote,
    results: report.results,
    skippedIndexedDbStores: report.skippedIndexedDbStores.map((entry) => entry.name),
  };

  await importRepo.put(runRecord);
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
  boundaryConflict: boolean;
  results: DesktopWebImportSurfaceResult[];
  skippedIndexedDbStores: IndexedDbSkipReport[];
}): DesktopWebImportReport {
  const counts: ImportCounts = {
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
    boundaryConflict: input.boundaryConflict,
    results: input.results,
    skippedIndexedDbStores: input.skippedIndexedDbStores,
    counts,
  };
}

function createRunId(trigger: DesktopWebImportTrigger): string {
  const stamp = Date.now().toString(36);
  return `${trigger}:${stamp}`;
}

type TauriInternals = {
  invoke?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
};

function createReposFromTauri(): {
  bridgeRepo: Repo<RepoRecord>;
  importRepo: Repo<RepoRecord>;
} | null {
  const tauriInternals = (window as Window & {
    __TAURI_INTERNALS__?: TauriInternals;
  }).__TAURI_INTERNALS__;

  if (!tauriInternals?.invoke) {
    return null;
  }

  const bridgeRepo = createTauriRepo<RepoRecord>(tauriInternals.invoke, {
    namespace: DESKTOP_REPO_NAMESPACE,
    schemaVersion: 1,
  });

  const importRepo = createTauriRepo<RepoRecord>(tauriInternals.invoke, {
    namespace: IMPORT_LEDGER_NAMESPACE,
    schemaVersion: IMPORT_LEDGER_SCHEMA_VERSION,
  });

  return { bridgeRepo, importRepo };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
