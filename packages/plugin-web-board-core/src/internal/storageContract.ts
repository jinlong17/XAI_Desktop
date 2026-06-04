/**
 * Board storage contract for `xai_boards_v2`.
 *
 * The shipped runtime historically stores a raw `Board[]`. This contract keeps
 * that shape readable while adding a versioned envelope and lossless logical
 * entity projection for future encrypted-blob sync/export rows.
 */

import type { Board, BoardCard, BoardList } from "../types.js";
import { isBoardArray } from "./isBoardArray.js";

export const BOARD_STORAGE_KEY = "xai_boards_v2" as const;
export const BOARD_STORAGE_SCHEMA_VERSION = 1 as const;
export const BOARD_STORAGE_ENVELOPE_KIND = "xai.web.board.storage" as const;
export const BOARD_STORAGE_ENTITY_SCHEMA_VERSION = 1 as const;

export type BoardStorageSource = "legacy-array" | "v1-envelope";
export type BoardStorageEntityType =
  | "project.board"
  | "project.list"
  | "project.card";

export interface BoardStorageEnvelopeV1 {
  kind: typeof BOARD_STORAGE_ENVELOPE_KIND;
  schemaVersion: typeof BOARD_STORAGE_SCHEMA_VERSION;
  boards: Board[];
  migratedFrom: BoardStorageSource;
  migratedAt?: string;
}

export type BoardStorageValue = Board[] | BoardStorageEnvelopeV1;

export type BoardStorageReadResult =
  | {
      status: "valid";
      source: BoardStorageSource;
      schemaVersion: typeof BOARD_STORAGE_SCHEMA_VERSION;
      boards: Board[];
    }
  | {
      status: "invalid";
      source: "invalid";
      schemaVersion: null;
      boards: null;
      reason: string;
    };

export type BoardStorageMigrationResult =
  | {
      status: "migrated";
      envelope: BoardStorageEnvelopeV1;
    }
  | {
      status: "already-current";
      envelope: BoardStorageEnvelopeV1;
    }
  | {
      status: "invalid";
      envelope: null;
      reason: string;
    };

export interface BoardStorageRecordBase {
  id: string;
  entityType: BoardStorageEntityType;
  schemaVersion: typeof BOARD_STORAGE_ENTITY_SCHEMA_VERSION;
  createdAt: string;
  updatedAt: string;
  syncScope: "account-sync";
}

export interface BoardStorageBoardEntity extends BoardStorageRecordBase {
  entityType: "project.board";
  boardId: string;
  workspaceId: string;
  title: string;
  template: Board["template"];
  listIds: string[];
  payload: Board;
}

export interface BoardStorageListEntity extends BoardStorageRecordBase {
  entityType: "project.list";
  projectId: string;
  listId: string;
  position: number;
  title: string;
  key: string | null;
  color: BoardList["color"];
  cardIds: string[];
  archived: boolean;
  payload: BoardList;
}

export interface BoardStorageCardEntity extends BoardStorageRecordBase {
  entityType: "project.card";
  projectId: string;
  listId: string;
  cardId: string;
  position: number;
  title: string;
  labelIds: string[];
  memberIds: string[];
  archived: boolean;
  checklistDone: number;
  checklistTotal: number;
  startDate?: string;
  dueDate?: string;
  payload: BoardCard;
}

export type BoardStorageLogicalEntity =
  | BoardStorageBoardEntity
  | BoardStorageListEntity
  | BoardStorageCardEntity;

export interface BoardStorageLogicalEntities {
  boards: BoardStorageBoardEntity[];
  lists: BoardStorageListEntity[];
  cards: BoardStorageCardEntity[];
  records: BoardStorageLogicalEntity[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function nonEmptyBoardArrayOrReason(
  boards: unknown,
): { boards: Board[] } | { reason: string } {
  if (!isBoardArray(boards)) {
    return { reason: "not a valid Board[]" };
  }
  if (boards.length === 0) {
    return { reason: "empty board array" };
  }
  return { boards };
}

export function isBoardStorageEnvelopeV1(
  value: unknown,
): value is BoardStorageEnvelopeV1 {
  if (!isObject(value)) return false;
  if (value.kind !== BOARD_STORAGE_ENVELOPE_KIND) return false;
  if (value.schemaVersion !== BOARD_STORAGE_SCHEMA_VERSION) return false;
  if (
    value.migratedFrom !== "legacy-array" &&
    value.migratedFrom !== "v1-envelope"
  ) {
    return false;
  }
  if (value.migratedAt !== undefined && !isString(value.migratedAt)) {
    return false;
  }
  return isBoardArray(value.boards);
}

export function readBoardStorage(raw: unknown): BoardStorageReadResult {
  const legacy = nonEmptyBoardArrayOrReason(raw);
  if ("boards" in legacy) {
    return {
      status: "valid",
      source: "legacy-array",
      schemaVersion: BOARD_STORAGE_SCHEMA_VERSION,
      boards: legacy.boards,
    };
  }

  if (isObject(raw) && raw.kind === BOARD_STORAGE_ENVELOPE_KIND) {
    if (raw.schemaVersion !== BOARD_STORAGE_SCHEMA_VERSION) {
      return {
        status: "invalid",
        source: "invalid",
        schemaVersion: null,
        boards: null,
        reason: `unsupported schemaVersion ${String(raw.schemaVersion)}`,
      };
    }
    if (!isBoardStorageEnvelopeV1(raw)) {
      return {
        status: "invalid",
        source: "invalid",
        schemaVersion: null,
        boards: null,
        reason: "malformed v1 envelope",
      };
    }
    const envelopeBoards = nonEmptyBoardArrayOrReason(raw.boards);
    if ("reason" in envelopeBoards) {
      return {
        status: "invalid",
        source: "invalid",
        schemaVersion: null,
        boards: null,
        reason: envelopeBoards.reason,
      };
    }
    return {
      status: "valid",
      source: "v1-envelope",
      schemaVersion: BOARD_STORAGE_SCHEMA_VERSION,
      boards: envelopeBoards.boards,
    };
  }

  return {
    status: "invalid",
    source: "invalid",
    schemaVersion: null,
    boards: null,
    reason: legacy.reason,
  };
}

function ensureWritableBoardArray(boards: readonly Board[]): Board[] {
  const nextBoards = [...boards];
  const result = nonEmptyBoardArrayOrReason(nextBoards);
  if ("reason" in result) {
    throw new Error(
      `[plugin-web-board-core] invalid board storage write: ${result.reason}`,
    );
  }
  return result.boards;
}

export function createBoardStorageEnvelope(
  boards: readonly Board[],
  options?: {
    migratedAt?: string;
    migratedFrom?: BoardStorageSource;
  },
): BoardStorageEnvelopeV1 {
  return {
    kind: BOARD_STORAGE_ENVELOPE_KIND,
    schemaVersion: BOARD_STORAGE_SCHEMA_VERSION,
    boards: ensureWritableBoardArray(boards),
    migratedFrom: options?.migratedFrom ?? "legacy-array",
    ...(options?.migratedAt ? { migratedAt: options.migratedAt } : {}),
  };
}

export function migrateBoardStorageRawToEnvelope(
  raw: unknown,
  options?: { migratedAt?: string },
): BoardStorageMigrationResult {
  if (isBoardStorageEnvelopeV1(raw)) {
    const read = readBoardStorage(raw);
    if (read.status === "invalid") {
      return { status: "invalid", envelope: null, reason: read.reason };
    }
    return { status: "already-current", envelope: raw };
  }

  const read = readBoardStorage(raw);
  if (read.status === "invalid") {
    return { status: "invalid", envelope: null, reason: read.reason };
  }

  return {
    status: "migrated",
    envelope: createBoardStorageEnvelope(read.boards, {
      migratedAt: options?.migratedAt ?? new Date().toISOString(),
      migratedFrom: "legacy-array",
    }),
  };
}

export function preserveBoardStorageFormat(
  previousRaw: unknown,
  nextBoards: readonly Board[],
): BoardStorageValue {
  const boards = ensureWritableBoardArray(nextBoards);
  if (!isBoardStorageEnvelopeV1(previousRaw)) {
    return boards;
  }
  return {
    ...previousRaw,
    boards,
  };
}

function entityBase<T extends BoardStorageEntityType>(
  id: string,
  entityType: T,
  now: string,
): BoardStorageRecordBase & { entityType: T } {
  return {
    id,
    entityType,
    schemaVersion: BOARD_STORAGE_ENTITY_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    syncScope: "account-sync",
  };
}

function textFromBilingual(value: { en: string; zh: string }): string {
  return value.en.trim() || value.zh.trim();
}

function textFromList(list: BoardList): string {
  if (list.customName) {
    return textFromBilingual(list.customName);
  }
  return list.key ?? list.id;
}

function checklistProgress(card: BoardCard): {
  checklistDone: number;
  checklistTotal: number;
} {
  if (card.checklistItems) {
    return {
      checklistDone: card.checklistItems.filter((item) => item.done).length,
      checklistTotal: card.checklistItems.length,
    };
  }
  return {
    checklistDone: card.checklist?.done ?? 0,
    checklistTotal: card.checklist?.total ?? 0,
  };
}

export function projectBoardStorageEntities(
  boards: readonly Board[],
  options: { now: string },
): BoardStorageLogicalEntities {
  const validBoards = ensureWritableBoardArray(boards);
  const boardEntities: BoardStorageBoardEntity[] = [];
  const listEntities: BoardStorageListEntity[] = [];
  const cardEntities: BoardStorageCardEntity[] = [];

  for (const board of validBoards) {
    boardEntities.push({
      ...entityBase(`project.board:${board.id}`, "project.board", options.now),
      boardId: board.id,
      workspaceId: board.workspaceId,
      title: textFromBilingual(board.name),
      template: board.template,
      listIds: board.lists.map((list) => list.id),
      payload: board,
    });

    board.lists.forEach((list, listIndex) => {
      listEntities.push({
        ...entityBase(
          `project.list:${board.id}:${list.id}`,
          "project.list",
          options.now,
        ),
        projectId: board.id,
        listId: list.id,
        position: listIndex,
        title: textFromList(list),
        key: list.key,
        color: list.color,
        cardIds: list.cards.map((card) => card.id),
        archived: list.archived === true,
        payload: list,
      });

      list.cards.forEach((card, cardIndex) => {
        const progress = checklistProgress(card);
        cardEntities.push({
          ...entityBase(
            `project.card:${board.id}:${list.id}:${card.id}`,
            "project.card",
            options.now,
          ),
          projectId: board.id,
          listId: list.id,
          cardId: card.id,
          position: cardIndex,
          title: textFromBilingual(card.title),
          labelIds: card.labels ?? [],
          memberIds: card.members ?? [],
          archived: card.archived === true,
          ...progress,
          ...(card.startDate ? { startDate: card.startDate } : {}),
          ...(card.dueDate ? { dueDate: card.dueDate } : {}),
          payload: card,
        });
      });
    });
  }

  return {
    boards: boardEntities,
    lists: listEntities,
    cards: cardEntities,
    records: [...boardEntities, ...listEntities, ...cardEntities],
  };
}
