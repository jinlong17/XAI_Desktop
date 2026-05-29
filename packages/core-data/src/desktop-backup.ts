import { OFFLINE_QUEUE_UNRESOLVED_STATUSES } from "./offline-edit-queue";
import { assertRepoRecord } from "./repo-utils";
import type { OutboxEntry } from "./sync-outbox";
import type { Repo, RepoRecord } from "./types";

export const DESKTOP_BACKUP_BUNDLE_VERSION = 1 as const;
export const DESKTOP_BACKUP_SOURCE_APP = "desktop-phase1-offline" as const;
export const DESKTOP_BACKUP_BRIDGE_NAMESPACE =
  "xai-web-desktop-local-first-bridge" as const;

export const DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES = [
  "productivity.todo",
  "productivity.habit",
  "project.board",
  "project.card",
  "productivity.pomodoro_sessions",
  "project.workspace_state",
  "pet.state",
  "settings.pref",
  "calendar.provider_state",
] as const;

export const DESKTOP_BACKUP_EXCLUDED_ENTITY_TYPES = [
  "sync.outbox",
  "desktop.web_import_ledger",
  "desktop.web_import_run",
] as const;

export type DesktopBackupRestorableEntityType =
  (typeof DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES)[number];

export type DesktopBackupExcludedEntityType =
  (typeof DESKTOP_BACKUP_EXCLUDED_ENTITY_TYPES)[number];

export type DesktopBackupVerifyStatus =
  | "verified_full"
  | "verified_partial"
  | "corrupt"
  | "incompatible"
  | "failed";

export type DesktopBackupRestoreStatus =
  | "restored"
  | "restored_partial"
  | "failed";

export interface DesktopBackupBundleManifest {
  bundleVersion: typeof DESKTOP_BACKUP_BUNDLE_VERSION;
  createdAt: string;
  sourceApp: typeof DESKTOP_BACKUP_SOURCE_APP;
  bridgeNamespace: typeof DESKTOP_BACKUP_BRIDGE_NAMESPACE;
  restorableEntityTypes: DesktopBackupRestorableEntityType[];
  excludedEntityTypes: DesktopBackupExcludedEntityType[];
  warnings: string[];
  restorableRecordCount: number;
  excludedRecordCount: number;
  restorableFingerprint: string;
}

export interface DesktopBackupBundleAudit {
  excludedQueueCount: number;
  excludedImportLedgerCount: number;
  excludedImportRunCount: number;
  unresolvedOutboxCount: number;
  excludedMutationIds: string[];
}

export interface DesktopBackupBundle {
  manifest: DesktopBackupBundleManifest;
  restorableRecords: RepoRecord[];
  audit: DesktopBackupBundleAudit;
}

export interface DesktopBackupVerifyResult {
  status: DesktopBackupVerifyStatus;
  reason?: string;
  warnings: string[];
  restorableRecordCount: number;
  excludedRecordCount: number;
  unresolvedOutboxCount: number;
  restorableFingerprint: string;
  bundle: DesktopBackupBundle | null;
}

export interface DesktopBackupApplyResult {
  status: DesktopBackupRestoreStatus;
  warnings: string[];
  restoredRecordCount: number;
  unresolvedTargetOutboxCount: number;
  restorableFingerprint: string;
}

export interface DesktopBackupLiveVerifyResult {
  match: boolean;
  expectedRestorableRecordCount: number;
  actualRestorableRecordCount: number;
  expectedRestorableFingerprint: string;
  actualRestorableFingerprint: string;
}

const RESTORABLE_ENTITY_TYPE_SET = new Set<string>(
  DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES,
);

const EXCLUDED_ENTITY_TYPE_SET = new Set<string>(DESKTOP_BACKUP_EXCLUDED_ENTITY_TYPES);

const OUTBOX_UNRESOLVED_STATUS_SET = new Set<string>(
  OFFLINE_QUEUE_UNRESOLVED_STATUSES,
);

export function createDesktopBackupBundle(input: {
  records: readonly RepoRecord[];
  createdAt?: string;
}): DesktopBackupBundle {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const restorableRecords: RepoRecord[] = [];
  const excludedRecords: RepoRecord[] = [];

  for (const row of input.records) {
    assertRepoRecord(row);
    if (RESTORABLE_ENTITY_TYPE_SET.has(row.entityType)) {
      restorableRecords.push(cloneRecord(row));
      continue;
    }
    if (EXCLUDED_ENTITY_TYPE_SET.has(row.entityType)) {
      excludedRecords.push(cloneRecord(row));
    }
  }

  const sortedRestorableRecords = sortRecords(restorableRecords);
  const fingerprint = createDesktopBackupFingerprint(sortedRestorableRecords);
  const audit = buildAudit(excludedRecords);
  const warnings = buildWarnings({
    excludedRecords,
    unresolvedOutboxCount: audit.unresolvedOutboxCount,
  });

  return {
    manifest: {
      bundleVersion: DESKTOP_BACKUP_BUNDLE_VERSION,
      createdAt,
      sourceApp: DESKTOP_BACKUP_SOURCE_APP,
      bridgeNamespace: DESKTOP_BACKUP_BRIDGE_NAMESPACE,
      restorableEntityTypes: [...DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES],
      excludedEntityTypes: [...DESKTOP_BACKUP_EXCLUDED_ENTITY_TYPES],
      warnings,
      restorableRecordCount: sortedRestorableRecords.length,
      excludedRecordCount: excludedRecords.length,
      restorableFingerprint: fingerprint,
    },
    restorableRecords: sortedRestorableRecords,
    audit,
  };
}

export function verifyDesktopBackupBundleJson(json: string): DesktopBackupVerifyResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    return {
      status: "corrupt",
      reason: asErrorMessage(error, "bundle JSON is malformed"),
      warnings: [],
      restorableRecordCount: 0,
      excludedRecordCount: 0,
      unresolvedOutboxCount: 0,
      restorableFingerprint: "",
      bundle: null,
    };
  }
  return verifyDesktopBackupBundle(parsed);
}

export function verifyDesktopBackupBundle(raw: unknown): DesktopBackupVerifyResult {
  const incompatible = (
    reason: string,
    restorableRecordCount = 0,
    excludedRecordCount = 0,
    unresolvedOutboxCount = 0,
    restorableFingerprint = "",
    warnings: string[] = [],
  ): DesktopBackupVerifyResult => ({
    status: "incompatible",
    reason,
    warnings,
    restorableRecordCount,
    excludedRecordCount,
    unresolvedOutboxCount,
    restorableFingerprint,
    bundle: null,
  });

  if (!isObject(raw)) {
    return incompatible("bundle payload must be an object");
  }

  const manifest = raw.manifest;
  if (!isObject(manifest)) {
    return incompatible("bundle manifest is missing or invalid");
  }

  if (manifest.bundleVersion !== DESKTOP_BACKUP_BUNDLE_VERSION) {
    return incompatible(
      `unsupported bundleVersion ${String(manifest.bundleVersion)}`,
    );
  }

  if (manifest.sourceApp !== DESKTOP_BACKUP_SOURCE_APP) {
    return incompatible(
      `unsupported sourceApp ${String(manifest.sourceApp)}`,
    );
  }

  if (manifest.bridgeNamespace !== DESKTOP_BACKUP_BRIDGE_NAMESPACE) {
    return incompatible(
      `unsupported bridgeNamespace ${String(manifest.bridgeNamespace)}`,
    );
  }

  if (!Array.isArray(raw.restorableRecords)) {
    return incompatible("restorableRecords must be an array");
  }

  const restorableRecords: RepoRecord[] = [];
  for (const value of raw.restorableRecords) {
    try {
      const row = value as RepoRecord;
      assertRepoRecord(row);
      if (!RESTORABLE_ENTITY_TYPE_SET.has(row.entityType)) {
        return incompatible(
          `restorable record entityType ${row.entityType} is not allowed`,
        );
      }
      restorableRecords.push(cloneRecord(row));
    } catch (error) {
      return {
        status: "corrupt",
        reason: asErrorMessage(error, "restorableRecords contains invalid records"),
        warnings: [],
        restorableRecordCount: 0,
        excludedRecordCount: 0,
        unresolvedOutboxCount: 0,
        restorableFingerprint: "",
        bundle: null,
      };
    }
  }

  const sortedRestorableRecords = sortRecords(restorableRecords);
  const computedFingerprint = createDesktopBackupFingerprint(sortedRestorableRecords);
  const manifestFingerprint = asString(manifest.restorableFingerprint);
  if (!manifestFingerprint) {
    return incompatible("manifest.restorableFingerprint is missing");
  }
  if (manifestFingerprint !== computedFingerprint) {
    return {
      status: "corrupt",
      reason: "restorable fingerprint mismatch",
      warnings: [],
      restorableRecordCount: 0,
      excludedRecordCount: 0,
      unresolvedOutboxCount: 0,
      restorableFingerprint: "",
      bundle: null,
    };
  }

  const manifestRestorableCount = asPositiveInt(manifest.restorableRecordCount);
  if (manifestRestorableCount === null) {
    return incompatible("manifest.restorableRecordCount is missing or invalid");
  }
  if (manifestRestorableCount !== sortedRestorableRecords.length) {
    return {
      status: "corrupt",
      reason: "manifest restorable count does not match records",
      warnings: [],
      restorableRecordCount: 0,
      excludedRecordCount: 0,
      unresolvedOutboxCount: 0,
      restorableFingerprint: "",
      bundle: null,
    };
  }

  const manifestExcludedCount = asNonNegativeInt(manifest.excludedRecordCount);
  if (manifestExcludedCount === null) {
    return incompatible("manifest.excludedRecordCount is missing or invalid");
  }

  const audit = normalizeAudit(raw.audit);
  if (!audit) {
    return incompatible("bundle audit section is missing or invalid");
  }

  const warnings = normalizeWarnings(manifest.warnings);
  if (warnings === null) {
    return incompatible("manifest.warnings must be a string array");
  }

  if (manifestExcludedCount !== expectedExcludedCountFromAudit(audit)) {
    return {
      status: "corrupt",
      reason: "manifest excluded count does not match audit summary",
      warnings: [],
      restorableRecordCount: 0,
      excludedRecordCount: 0,
      unresolvedOutboxCount: 0,
      restorableFingerprint: "",
      bundle: null,
    };
  }

  const bundle: DesktopBackupBundle = {
    manifest: {
      bundleVersion: DESKTOP_BACKUP_BUNDLE_VERSION,
      createdAt: asString(manifest.createdAt) ?? "",
      sourceApp: DESKTOP_BACKUP_SOURCE_APP,
      bridgeNamespace: DESKTOP_BACKUP_BRIDGE_NAMESPACE,
      restorableEntityTypes: [...DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES],
      excludedEntityTypes: [...DESKTOP_BACKUP_EXCLUDED_ENTITY_TYPES],
      warnings,
      restorableRecordCount: sortedRestorableRecords.length,
      excludedRecordCount: manifestExcludedCount,
      restorableFingerprint: computedFingerprint,
    },
    restorableRecords: sortedRestorableRecords,
    audit,
  };

  const hasPartialSignals =
    manifestExcludedCount > 0 || warnings.length > 0 || audit.unresolvedOutboxCount > 0;

  return {
    status: hasPartialSignals ? "verified_partial" : "verified_full",
    reason: undefined,
    warnings,
    restorableRecordCount: sortedRestorableRecords.length,
    excludedRecordCount: manifestExcludedCount,
    unresolvedOutboxCount: audit.unresolvedOutboxCount,
    restorableFingerprint: computedFingerprint,
    bundle,
  };
}

export async function applyDesktopBackupBundle(input: {
  repo: Repo<RepoRecord>;
  bundle: DesktopBackupBundle;
}): Promise<DesktopBackupApplyResult> {
  const unresolvedTargetOutboxCount = await countUnresolvedOutboxRows(input.repo);
  if (unresolvedTargetOutboxCount > 0) {
    return {
      status: "failed",
      warnings: [
        `target repo has ${unresolvedTargetOutboxCount} unresolved sync.outbox rows`,
      ],
      restoredRecordCount: 0,
      unresolvedTargetOutboxCount,
      restorableFingerprint: input.bundle.manifest.restorableFingerprint,
    };
  }

  const recordsByEntityType = new Map<string, RepoRecord[]>();
  for (const entityType of DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES) {
    recordsByEntityType.set(entityType, []);
  }
  for (const row of input.bundle.restorableRecords) {
    const bucket = recordsByEntityType.get(row.entityType);
    if (!bucket) {
      continue;
    }
    bucket.push(cloneRecord(row));
  }

  await input.repo.transaction(async (tx) => {
    for (const entityType of DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES) {
      const existing = await tx.list({ entityType });
      for (const row of existing) {
        await tx.delete(row.id);
      }

      const nextRecords = recordsByEntityType.get(entityType) ?? [];
      for (const row of nextRecords) {
        await tx.put(row);
      }
    }
  });

  const status: DesktopBackupRestoreStatus =
    input.bundle.manifest.excludedRecordCount > 0 ? "restored_partial" : "restored";

  return {
    status,
    warnings: [...input.bundle.manifest.warnings],
    restoredRecordCount: input.bundle.manifest.restorableRecordCount,
    unresolvedTargetOutboxCount: 0,
    restorableFingerprint: input.bundle.manifest.restorableFingerprint,
  };
}

export async function verifyDesktopBackupApply(input: {
  repo: Repo<RepoRecord>;
  bundle: DesktopBackupBundle;
}): Promise<DesktopBackupLiveVerifyResult> {
  const liveRows: RepoRecord[] = [];
  for (const entityType of DESKTOP_BACKUP_RESTORABLE_ENTITY_TYPES) {
    const rows = await input.repo.list({ entityType });
    liveRows.push(...rows);
  }
  const sortedLiveRows = sortRecords(liveRows);
  const liveFingerprint = createDesktopBackupFingerprint(sortedLiveRows);

  return {
    match:
      sortedLiveRows.length === input.bundle.manifest.restorableRecordCount &&
      liveFingerprint === input.bundle.manifest.restorableFingerprint,
    expectedRestorableRecordCount: input.bundle.manifest.restorableRecordCount,
    actualRestorableRecordCount: sortedLiveRows.length,
    expectedRestorableFingerprint: input.bundle.manifest.restorableFingerprint,
    actualRestorableFingerprint: liveFingerprint,
  };
}

export async function countUnresolvedOutboxRows(
  repo: Repo<RepoRecord>,
): Promise<number> {
  const outboxRows = await repo.list({ entityType: "sync.outbox" });
  return outboxRows.reduce((count, row) => {
    const typedRow = row as OutboxEntry;
    if (!OUTBOX_UNRESOLVED_STATUS_SET.has(typedRow.queueStatus)) {
      return count;
    }
    return count + 1;
  }, 0);
}

export function createDesktopBackupFingerprint(records: readonly RepoRecord[]): string {
  const canonical = stableStringify(records.map((row) => cloneRecord(row)));
  return `fnv1a64:${fnv1a64Hex(canonical)}`;
}

function buildAudit(excludedRows: readonly RepoRecord[]): DesktopBackupBundleAudit {
  const outboxRows = excludedRows.filter(
    (row) => row.entityType === "sync.outbox",
  ) as OutboxEntry[];
  const unresolvedOutboxCount = outboxRows.reduce((count, row) => {
    if (OUTBOX_UNRESOLVED_STATUS_SET.has(row.queueStatus)) {
      return count + 1;
    }
    return count;
  }, 0);

  const excludedMutationIds = outboxRows
    .map((row) => row.mutationId)
    .filter((value): value is string => typeof value === "string")
    .slice(0, 200);

  return {
    excludedQueueCount: outboxRows.length,
    excludedImportLedgerCount: excludedRows.filter(
      (row) => row.entityType === "desktop.web_import_ledger",
    ).length,
    excludedImportRunCount: excludedRows.filter(
      (row) => row.entityType === "desktop.web_import_run",
    ).length,
    unresolvedOutboxCount,
    excludedMutationIds,
  };
}

function buildWarnings(input: {
  excludedRecords: readonly RepoRecord[];
  unresolvedOutboxCount: number;
}): string[] {
  const warnings: string[] = [];

  if (input.excludedRecords.length > 0) {
    warnings.push(
      "Excluded operational state exists (sync.outbox or desktop.web_import_*); restore remains partial by design.",
    );
  }

  if (input.unresolvedOutboxCount > 0) {
    warnings.push(
      `Excluded unresolved sync.outbox rows: ${input.unresolvedOutboxCount}.`,
    );
  }

  return warnings;
}

function normalizeAudit(raw: unknown): DesktopBackupBundleAudit | null {
  if (!isObject(raw)) {
    return null;
  }

  const excludedQueueCount = asNonNegativeInt(raw.excludedQueueCount);
  const excludedImportLedgerCount = asNonNegativeInt(raw.excludedImportLedgerCount);
  const excludedImportRunCount = asNonNegativeInt(raw.excludedImportRunCount);
  const unresolvedOutboxCount = asNonNegativeInt(raw.unresolvedOutboxCount);

  if (
    excludedQueueCount === null ||
    excludedImportLedgerCount === null ||
    excludedImportRunCount === null ||
    unresolvedOutboxCount === null
  ) {
    return null;
  }

  const excludedMutationIds = Array.isArray(raw.excludedMutationIds)
    ? raw.excludedMutationIds.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
    : [];

  if (unresolvedOutboxCount > excludedQueueCount) {
    return null;
  }

  return {
    excludedQueueCount,
    excludedImportLedgerCount,
    excludedImportRunCount,
    unresolvedOutboxCount,
    excludedMutationIds,
  };
}

function normalizeWarnings(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }

  const warnings: string[] = [];
  for (const value of raw) {
    if (typeof value !== "string") {
      return null;
    }
    warnings.push(value);
  }
  return warnings;
}

function expectedExcludedCountFromAudit(audit: DesktopBackupBundleAudit): number {
  return (
    audit.excludedQueueCount +
    audit.excludedImportLedgerCount +
    audit.excludedImportRunCount
  );
}

function sortRecords(records: readonly RepoRecord[]): RepoRecord[] {
  return [...records].sort((left, right) => {
    const entityCompare = left.entityType.localeCompare(right.entityType);
    if (entityCompare !== 0) {
      return entityCompare;
    }
    return left.id.localeCompare(right.id);
  });
}

function cloneRecord<T extends RepoRecord>(record: T): T {
  return JSON.parse(JSON.stringify(record)) as T;
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

  if (isObject(value)) {
    const keys = Object.keys(value).sort((left, right) =>
      left.localeCompare(right),
    );
    const output: Record<string, unknown> = {};
    for (const key of keys) {
      const next = value[key];
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

function asErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function asNonNegativeInt(value: unknown): number | null {
  if (!Number.isInteger(value) || (value as number) < 0) {
    return null;
  }
  return value as number;
}

function asPositiveInt(value: unknown): number | null {
  if (!Number.isInteger(value) || (value as number) < 1) {
    return null;
  }
  return value as number;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
