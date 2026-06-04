import type { Board } from "../types.js";
import { isBoardArray } from "./isBoardArray.js";
import {
  BOARD_STORAGE_KEY,
  BOARD_STORAGE_SCHEMA_VERSION,
  createBoardStorageEnvelope,
  isBoardStorageEnvelopeV1,
  projectBoardStorageEntities,
  readBoardStorage,
  type BoardStorageLogicalEntities,
  type BoardStorageSource,
  type BoardStorageValue,
} from "./storageContract.js";

export const BOARD_EXPORT_PAYLOAD_KIND = "xai.web.board.export" as const;
export const BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION = 1 as const;

export interface BoardExportPayloadV1 {
  kind: typeof BOARD_EXPORT_PAYLOAD_KIND;
  schemaVersion: typeof BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION;
  exportedAt: string;
  storageKey: typeof BOARD_STORAGE_KEY;
  storageSource: BoardStorageSource;
  storageValue: BoardStorageValue;
  boards: Board[];
  logicalEntities: BoardStorageLogicalEntities;
}

export type BoardExportPayloadResult =
  | {
      status: "valid";
      payload: BoardExportPayloadV1;
    }
  | {
      status: "invalid";
      payload: null;
      reason: string;
    };

export type BoardExportPayloadReadResult = BoardExportPayloadResult;

export type BoardImportStorageValueResult =
  | {
      status: "valid";
      storageValue: BoardStorageValue;
      boards: Board[];
    }
  | {
      status: "invalid";
      storageValue: null;
      boards: null;
      reason: string;
    };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoardStorageSource(value: unknown): value is BoardStorageSource {
  return value === "legacy-array" || value === "v1-envelope";
}

function isLogicalEntityCollection(value: unknown): value is BoardStorageLogicalEntities {
  if (!isObject(value)) return false;
  if (!Array.isArray(value.boards)) return false;
  if (!Array.isArray(value.lists)) return false;
  if (!Array.isArray(value.cards)) return false;
  if (!Array.isArray(value.records)) return false;

  const isRecord = (record: unknown): record is Record<string, unknown> => {
    if (!isObject(record)) return false;
    if (!isString(record.id)) return false;
    if (record.schemaVersion !== BOARD_STORAGE_SCHEMA_VERSION) return false;
    if (!isString(record.createdAt) || !isString(record.updatedAt)) return false;
    if (record.syncScope !== "account-sync") return false;
    return (
      record.entityType === "project.board" ||
      record.entityType === "project.list" ||
      record.entityType === "project.card"
    );
  };

  return (
    value.boards.every(isRecord) &&
    value.lists.every(isRecord) &&
    value.cards.every(isRecord) &&
    value.records.every(isRecord)
  );
}

function idsOf(records: readonly { id: string }[]): string[] {
  return records.map((record) => record.id).sort();
}

function logicalEntitiesMatchBoards(
  boards: readonly Board[],
  logicalEntities: BoardStorageLogicalEntities,
): boolean {
  const expected = projectBoardStorageEntities(boards, {
    now: "1970-01-01T00:00:00.000Z",
  });
  return (
    idsOf(logicalEntities.boards).join("\n") === idsOf(expected.boards).join("\n") &&
    idsOf(logicalEntities.lists).join("\n") === idsOf(expected.lists).join("\n") &&
    idsOf(logicalEntities.cards).join("\n") === idsOf(expected.cards).join("\n") &&
    idsOf(logicalEntities.records).join("\n") === idsOf(expected.records).join("\n")
  );
}

function storageValueForExport(
  raw: unknown,
  boards: readonly Board[],
  source: BoardStorageSource,
  exportedAt: string,
): BoardStorageValue {
  if (isBoardStorageEnvelopeV1(raw)) {
    return raw;
  }
  return createBoardStorageEnvelope(boards, {
    migratedAt: exportedAt,
    migratedFrom: source,
  });
}

export function createBoardExportPayload(
  raw: unknown,
  options?: { exportedAt?: string },
): BoardExportPayloadResult {
  const read = readBoardStorage(raw);
  if (read.status === "invalid") {
    return {
      status: "invalid",
      payload: null,
      reason: read.reason,
    };
  }

  const exportedAt = options?.exportedAt ?? new Date().toISOString();
  const storageValue = storageValueForExport(
    raw,
    read.boards,
    read.source,
    exportedAt,
  );

  return {
    status: "valid",
    payload: {
      kind: BOARD_EXPORT_PAYLOAD_KIND,
      schemaVersion: BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION,
      exportedAt,
      storageKey: BOARD_STORAGE_KEY,
      storageSource: read.source,
      storageValue,
      boards: read.boards,
      logicalEntities: projectBoardStorageEntities(read.boards, {
        now: exportedAt,
      }),
    },
  };
}

export function readBoardExportPayload(
  raw: unknown,
): BoardExportPayloadReadResult {
  if (!isObject(raw)) {
    return { status: "invalid", payload: null, reason: "payload is not an object" };
  }
  if (raw.kind !== BOARD_EXPORT_PAYLOAD_KIND) {
    return { status: "invalid", payload: null, reason: "unsupported payload kind" };
  }
  if (raw.schemaVersion !== BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION) {
    return {
      status: "invalid",
      payload: null,
      reason: `unsupported payload schemaVersion ${String(raw.schemaVersion)}`,
    };
  }
  if (!isString(raw.exportedAt)) {
    return { status: "invalid", payload: null, reason: "missing exportedAt" };
  }
  if (raw.storageKey !== BOARD_STORAGE_KEY) {
    return { status: "invalid", payload: null, reason: "unsupported storageKey" };
  }
  if (!isBoardStorageSource(raw.storageSource)) {
    return { status: "invalid", payload: null, reason: "unsupported storageSource" };
  }
  if (!isBoardArray(raw.boards)) {
    return { status: "invalid", payload: null, reason: "malformed boards" };
  }

  const storageRead = readBoardStorage(raw.storageValue);
  if (storageRead.status === "invalid") {
    return {
      status: "invalid",
      payload: null,
      reason: `malformed storageValue: ${storageRead.reason}`,
    };
  }
  if (!isLogicalEntityCollection(raw.logicalEntities)) {
    return {
      status: "invalid",
      payload: null,
      reason: "malformed logicalEntities",
    };
  }
  if (!logicalEntitiesMatchBoards(raw.boards, raw.logicalEntities)) {
    return {
      status: "invalid",
      payload: null,
      reason: "logicalEntities do not match boards",
    };
  }
  const storageValue = raw.storageValue as BoardStorageValue;

  return {
    status: "valid",
    payload: {
      kind: BOARD_EXPORT_PAYLOAD_KIND,
      schemaVersion: BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION,
      exportedAt: raw.exportedAt,
      storageKey: BOARD_STORAGE_KEY,
      storageSource: raw.storageSource,
      storageValue,
      boards: raw.boards,
      logicalEntities: raw.logicalEntities,
    },
  };
}

export function boardImportStorageValueFromPayload(
  raw: unknown,
): BoardImportStorageValueResult {
  const read = readBoardExportPayload(raw);
  if (read.status === "invalid") {
    return {
      status: "invalid",
      storageValue: null,
      boards: null,
      reason: read.reason,
    };
  }

  const storageRead = readBoardStorage(read.payload.storageValue);
  if (storageRead.status === "invalid") {
    return {
      status: "invalid",
      storageValue: null,
      boards: null,
      reason: storageRead.reason,
    };
  }

  return {
    status: "valid",
    storageValue: read.payload.storageValue,
    boards: storageRead.boards,
  };
}
