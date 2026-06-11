import type { RepoRecord } from "./types";

export const DESKTOP_WEB_IMPORT_SURFACES = [
  "tasks",
  "habits",
  "pomodoro",
  "boards",
  "board-workspace",
  "pet",
  "settings",
] as const;

export type DesktopWebImportSurface =
  (typeof DESKTOP_WEB_IMPORT_SURFACES)[number];

export type DesktopWebImportTrigger = "first-run-scan" | "explicit-import";

export type DesktopWebImportSurfaceStatus =
  | "imported"
  | "unchanged"
  | "empty"
  | "skipped"
  | "corrupt"
  | "failed";

export type DesktopWebImportSkippedReason =
  | "browser_owned_store"
  | "unsupported_surface"
  | "boundary_conflict";

export interface DesktopWebImportSurfaceResult {
  surface: DesktopWebImportSurface;
  status: DesktopWebImportSurfaceStatus;
  sourceFingerprint?: string;
  importedCount?: number;
  deletedCount?: number;
  unchangedCount?: number;
  skippedReason?: DesktopWebImportSkippedReason;
  message?: string;
}

export interface DesktopWebImportLedgerRecord extends RepoRecord {
  entityType: "desktop.web_import_ledger";
  syncScope: "device-local";
  surface: DesktopWebImportSurface;
  boundaryKey: string;
  sourceFingerprint: string;
  importedRecordIds: string[];
  lastStatus: DesktopWebImportSurfaceStatus;
  lastRunAt: string;
}

export interface DesktopWebImportRunRecord extends RepoRecord {
  entityType: "desktop.web_import_run";
  syncScope: "device-local";
  runId: string;
  trigger: DesktopWebImportTrigger;
  boundaryKey: string;
  wrote: boolean;
  results: DesktopWebImportSurfaceResult[];
  skippedIndexedDbStores: string[];
}

const LEDGER_ID_PREFIX = "desktop-web-import-ledger:";
const RUN_ID_PREFIX = "desktop-web-import-run:";

export function normalizeImportBoundaryKey(boundaryKey?: string | null): string {
  if (typeof boundaryKey !== "string") {
    return "local-session";
  }
  const trimmed = boundaryKey.trim();
  return trimmed.length > 0 ? trimmed : "local-session";
}

export function buildDesktopWebImportLedgerId(
  boundaryKey: string,
  surface: DesktopWebImportSurface,
): string {
  const normalizedBoundary = normalizeImportBoundaryKey(boundaryKey);
  return `${LEDGER_ID_PREFIX}${normalizedBoundary}:${surface}`;
}

export function buildDesktopWebImportRunRecordId(runId: string): string {
  const safeRunId = runId.trim().length > 0 ? runId.trim() : "unknown-run";
  return `${RUN_ID_PREFIX}${safeRunId}`;
}

export function createDesktopWebImportFingerprint(value: unknown): string {
  const canonical = stableStringify(value);
  return `fnv1a64:${fnv1a64Hex(canonical)}`;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stabilize(value));
}

function stabilize(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => stabilize(entry));
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const keys = Object.keys(objectValue).sort((left, right) =>
      left.localeCompare(right),
    );
    const output: Record<string, unknown> = {};
    for (const key of keys) {
      const next = objectValue[key];
      if (typeof next === "undefined" || typeof next === "function") {
        continue;
      }
      output[key] = stabilize(next);
    }
    return output;
  }

  return String(value);
}

function fnv1a64Hex(input: string): string {
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < input.length; index += 1) {
    const codePoint = BigInt(input.charCodeAt(index));
    hash ^= codePoint;
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}
