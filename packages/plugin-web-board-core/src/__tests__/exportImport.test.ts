import { describe, expect, test } from "vitest";
import {
  BOARD_EXPORT_PAYLOAD_KIND,
  BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION,
  boardImportStorageValueFromPayload,
  createBoardExportPayload,
  readBoardExportPayload,
} from "../internal/exportImport.js";
import {
  BOARD_STORAGE_KEY,
  createBoardStorageEnvelope,
  isBoardStorageEnvelopeV1,
} from "../internal/storageContract.js";
import { makeDefaultBoards } from "../internal/seed/board-data.js";

const EXPORTED_AT = "2026-06-03T22:55:00.000Z";

describe("board export/import contract", () => {
  test("EI1 creates a v1 payload from legacy Board[] storage", () => {
    const boards = makeDefaultBoards();
    const result = createBoardExportPayload(boards, { exportedAt: EXPORTED_AT });

    expect(result.status).toBe("valid");
    if (result.status !== "valid") throw new Error("expected valid export");
    expect(result.payload.kind).toBe(BOARD_EXPORT_PAYLOAD_KIND);
    expect(result.payload.schemaVersion).toBe(BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION);
    expect(result.payload.exportedAt).toBe(EXPORTED_AT);
    expect(result.payload.storageKey).toBe(BOARD_STORAGE_KEY);
    expect(result.payload.storageSource).toBe("legacy-array");
    expect(result.payload.boards).toBe(boards);
    expect(isBoardStorageEnvelopeV1(result.payload.storageValue)).toBe(true);
  });

  test("EI2 payload includes board/list/card logical entities", () => {
    const boards = makeDefaultBoards();
    const result = createBoardExportPayload(boards, { exportedAt: EXPORTED_AT });

    expect(result.status).toBe("valid");
    if (result.status !== "valid") throw new Error("expected valid export");
    expect(result.payload.logicalEntities.boards.length).toBe(boards.length);
    expect(result.payload.logicalEntities.lists.length).toBe(
      boards.reduce((count, board) => count + board.lists.length, 0),
    );
    expect(result.payload.logicalEntities.cards.length).toBe(
      boards.reduce(
        (count, board) =>
          count +
          board.lists.reduce(
            (listCount, list) => listCount + list.cards.length,
            0,
          ),
        0,
      ),
    );
    expect(result.payload.logicalEntities.records.map((record) => record.entityType)).toEqual(
      expect.arrayContaining(["project.board", "project.list", "project.card"]),
    );
  });

  test("EI3 existing v1 envelope export preserves storage value", () => {
    const envelope = createBoardStorageEnvelope(makeDefaultBoards(), {
      migratedAt: EXPORTED_AT,
    });
    const result = createBoardExportPayload(envelope, { exportedAt: EXPORTED_AT });

    expect(result.status).toBe("valid");
    if (result.status !== "valid") throw new Error("expected valid export");
    expect(result.payload.storageSource).toBe("v1-envelope");
    expect(result.payload.storageValue).toBe(envelope);
  });

  test("EI4 malformed or empty storage fails closed", () => {
    expect(createBoardExportPayload("bad").status).toBe("invalid");
    expect(createBoardExportPayload([]).status).toBe("invalid");
  });

  test("EI5 readBoardExportPayload accepts a generated payload", () => {
    const created = createBoardExportPayload(makeDefaultBoards(), {
      exportedAt: EXPORTED_AT,
    });
    if (created.status !== "valid") throw new Error("expected valid export");

    const read = readBoardExportPayload(created.payload);
    expect(read.status).toBe("valid");
    if (read.status !== "valid") throw new Error("expected valid read");
    expect(read.payload.storageKey).toBe(BOARD_STORAGE_KEY);
    expect(read.payload.boards.length).toBeGreaterThan(0);
  });

  test("EI6 readBoardExportPayload rejects bad kind, schema, storage, and entities", () => {
    const created = createBoardExportPayload(makeDefaultBoards(), {
      exportedAt: EXPORTED_AT,
    });
    if (created.status !== "valid") throw new Error("expected valid export");

    expect(readBoardExportPayload({ ...created.payload, kind: "other" }).status).toBe("invalid");
    expect(readBoardExportPayload({ ...created.payload, schemaVersion: 2 }).status).toBe("invalid");
    expect(readBoardExportPayload({ ...created.payload, storageValue: "bad" }).status).toBe("invalid");
    expect(readBoardExportPayload({ ...created.payload, logicalEntities: {} }).status).toBe("invalid");
  });

  test("EI7 import helper returns a validated storage value for xai_boards_v2 writes", () => {
    const created = createBoardExportPayload(makeDefaultBoards(), {
      exportedAt: EXPORTED_AT,
    });
    if (created.status !== "valid") throw new Error("expected valid export");

    const imported = boardImportStorageValueFromPayload(created.payload);
    expect(imported.status).toBe("valid");
    if (imported.status !== "valid") throw new Error("expected valid import");
    expect(imported.storageValue).toBe(created.payload.storageValue);
    expect(imported.boards).toEqual(created.payload.boards);
  });

  test("EI8 import helper rejects invalid payloads without throwing", () => {
    const imported = boardImportStorageValueFromPayload({
      kind: BOARD_EXPORT_PAYLOAD_KIND,
      schemaVersion: 999,
    });
    expect(imported.status).toBe("invalid");
    if (imported.status !== "invalid") throw new Error("expected invalid import");
    expect(imported.storageValue).toBeNull();
  });
});
