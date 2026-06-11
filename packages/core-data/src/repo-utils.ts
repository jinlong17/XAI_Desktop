import type {
  MigrationPlan,
  MigrationResult,
  RepoListQuery,
  RepoRecord,
} from "./types";

const ENTITY_TYPE_RE = /^[a-z]+\.[a-z_]+$/;

export function assertRepoRecord(record: RepoRecord): void {
  if (typeof record.id !== "string" || record.id.length === 0) {
    throw new Error("E3005: core-data record is missing id");
  }
  if (typeof record.entityType !== "string" || record.entityType.length === 0) {
    throw new Error("E3005: core-data record is missing entityType");
  }
  if (!ENTITY_TYPE_RE.test(record.entityType)) {
    throw new Error(
      `E3005: core-data record entityType "${record.entityType}" violates plugin.entity regex`,
    );
  }
  if (!Number.isInteger(record.schemaVersion) || record.schemaVersion < 1) {
    throw new Error("E3005: core-data record has invalid schemaVersion");
  }
  if (
    typeof record.createdAt !== "string" ||
    typeof record.updatedAt !== "string"
  ) {
    throw new Error("E3005: core-data record is missing timestamps");
  }
  if (
    record.syncScope !== "device-local" &&
    record.syncScope !== "account-sync"
  ) {
    throw new Error("E3005: core-data record has invalid syncScope");
  }
  if (
    record.entityType === "clipboard.item" &&
    record.syncScope !== "device-local"
  ) {
    throw new Error(
      `E3005: clipboard.item must be device-local, got "${record.syncScope}"`,
    );
  }
  if (
    record.entityType === "calendar.provider_state" &&
    record.syncScope !== "device-local"
  ) {
    throw new Error(
      `E3005: calendar.provider_state must be device-local, got "${record.syncScope}"`,
    );
  }
  if (
    (record.entityType === "organizer.grid" ||
      record.entityType === "organizer.item") &&
    record.syncScope !== "device-local"
  ) {
    throw new Error(
      `E3005: ${record.entityType} must be device-local, got "${record.syncScope}"`,
    );
  }
}

export function applyRepoListQuery<T extends RepoRecord>(
  records: Iterable<T>,
  query: RepoListQuery<T> = {},
): T[] {
  let result = [...records];

  if (query.entityType) {
    result = result.filter((record) => record.entityType === query.entityType);
  }

  if (query.syncScope) {
    result = result.filter((record) => record.syncScope === query.syncScope);
  }

  if (query.orderBy) {
    const { field, direction = "asc" } = query.orderBy;
    result.sort((left, right) => {
      const order = compareRepoValues(left[field], right[field]);
      return direction === "asc" ? order : -order;
    });
  }

  if (query.limit !== undefined) {
    if (!Number.isInteger(query.limit) || query.limit < 0) {
      throw new Error("E3005: core-data list query has invalid limit");
    }
    result = result.slice(0, query.limit);
  }

  return result;
}

export function applyRepoIndexQuery<
  T extends RepoRecord,
  K extends Extract<keyof T, string>,
>(records: Iterable<T>, field: K, value: T[K], query?: RepoListQuery<T>): T[] {
  return applyRepoListQuery(
    [...records].filter((record) => Object.is(record[field], value)),
    query,
  );
}

export function assertMigrationPlan<T extends RepoRecord>(
  plan: MigrationPlan<T>,
  migrationVersion: number,
): void {
  if (plan.fromVersion >= plan.toVersion) {
    throw new Error("E3006: core-data migration must increase version");
  }
  if (migrationVersion !== plan.fromVersion) {
    throw new Error(
      `E3006: core-data migration expected version ${plan.fromVersion}, got ${migrationVersion}`,
    );
  }
}

export function skippedMigrationResult<T extends RepoRecord>(
  plan: MigrationPlan<T>,
  nowIso: () => string,
): MigrationResult {
  const timestamp = nowIso();
  return {
    id: plan.id,
    fromVersion: plan.fromVersion,
    toVersion: plan.toVersion,
    startedAt: timestamp,
    completedAt: timestamp,
    applied: false,
  };
}

function compareRepoValues(left: unknown, right: unknown): number {
  if (left === right) {
    return 0;
  }
  if (typeof left === "number" && typeof right === "number") {
    return left < right ? -1 : 1;
  }
  return String(left).localeCompare(String(right));
}
