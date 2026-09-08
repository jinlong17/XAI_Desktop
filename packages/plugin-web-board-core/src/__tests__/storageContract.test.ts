import { describe, expect, test } from "vitest";
import {
  BOARD_STORAGE_ENVELOPE_KIND,
  BOARD_STORAGE_ENTITY_SCHEMA_VERSION,
  BOARD_STORAGE_KEY,
  BOARD_STORAGE_SCHEMA_VERSION,
  createBoardStorageEnvelope,
  isBoardStorageEnvelopeV1,
  migrateBoardStorageRawToEnvelope,
  preserveBoardStorageFormat,
  projectBoardStorageEntities,
  readBoardStorage,
} from "../internal/storageContract.js";
import { makeDefaultBoards } from "../internal/seed/board-data.js";
import type { Board } from "../types.js";

function makeRichBoards(): Board[] {
  const boards = makeDefaultBoards();
  boards[0]!.lists[0]!.archived = true;
  boards[0]!.lists[0]!.cards[0] = {
    ...boards[0]!.lists[0]!.cards[0]!,
    archived: true,
    description: "Detailed card body",
    checklistItems: [
      { id: "i1", text: "First", done: true },
      { id: "i2", text: "Second", done: false },
    ],
    attachments: [{ id: "a1", url: "https://example.com", title: "Spec" }],
    activity: [
      {
        id: "act1",
        kind: "note",
        body: "Created",
        createdAt: "2026-06-03T00:00:00.000Z",
      },
    ],
    startDate: "2026-06-03",
    dueDate: "2026-06-04",
  };
  return boards;
}

describe("board storage contract", () => {
  test("SC1 constants freeze the xai_boards_v2 v1 contract", () => {
    expect(BOARD_STORAGE_KEY).toBe("xai_boards_v2");
    expect(BOARD_STORAGE_ENVELOPE_KIND).toBe("xai.web.board.storage");
    expect(BOARD_STORAGE_SCHEMA_VERSION).toBe(1);
    expect(BOARD_STORAGE_ENTITY_SCHEMA_VERSION).toBe(1);
  });

  test("SC2 readBoardStorage accepts legacy Board[] values", () => {
    const boards = makeDefaultBoards();
    const read = readBoardStorage(boards);
    expect(read.status).toBe("valid");
    if (read.status !== "valid") throw new Error("expected valid read");
    expect(read.source).toBe("legacy-array");
    expect(read.boards).toBe(boards);
  });

  test("SC3 readBoardStorage accepts v1 envelopes", () => {
    const boards = makeDefaultBoards();
    const envelope = createBoardStorageEnvelope(boards, {
      migratedAt: "2026-06-03T00:00:00.000Z",
    });
    const read = readBoardStorage(envelope);
    expect(read.status).toBe("valid");
    if (read.status !== "valid") throw new Error("expected valid read");
    expect(read.source).toBe("v1-envelope");
    expect(read.boards).toEqual(boards);
  });

  test("SC4 invalid or unsupported envelopes fail closed", () => {
    expect(
      readBoardStorage({
        kind: BOARD_STORAGE_ENVELOPE_KIND,
        schemaVersion: 2,
        boards: makeDefaultBoards(),
        migratedFrom: "legacy-array",
      }).status,
    ).toBe("invalid");
    expect(
      readBoardStorage({
        kind: BOARD_STORAGE_ENVELOPE_KIND,
        schemaVersion: 1,
        boards: "not boards",
        migratedFrom: "legacy-array",
      }).status,
    ).toBe("invalid");
  });

  test("SC5 migration helper converts legacy arrays and skips current envelopes", () => {
    const boards = makeDefaultBoards();
    const migrated = migrateBoardStorageRawToEnvelope(boards, {
      migratedAt: "2026-06-03T00:00:00.000Z",
    });
    expect(migrated.status).toBe("migrated");
    if (migrated.status !== "migrated") throw new Error("expected migration");
    expect(migrated.envelope.boards).toEqual(boards);
    expect(migrated.envelope.migratedFrom).toBe("legacy-array");
    expect(migrated.envelope.migratedAt).toBe("2026-06-03T00:00:00.000Z");

    const skipped = migrateBoardStorageRawToEnvelope(migrated.envelope);
    expect(skipped.status).toBe("already-current");
    if (skipped.status !== "already-current") {
      throw new Error("expected already-current");
    }
    expect(skipped.envelope).toBe(migrated.envelope);
  });

  test("SC6 preserveBoardStorageFormat keeps envelope form only when previous raw was envelope", () => {
    const boards = makeDefaultBoards();
    const nextBoards = boards.map((board) => ({ ...board }));
    const legacyWrite = preserveBoardStorageFormat(boards, nextBoards);
    expect(Array.isArray(legacyWrite)).toBe(true);

    const envelope = createBoardStorageEnvelope(boards);
    const envelopeWrite = preserveBoardStorageFormat(envelope, nextBoards);
    expect(isBoardStorageEnvelopeV1(envelopeWrite)).toBe(true);
    if (!isBoardStorageEnvelopeV1(envelopeWrite)) {
      throw new Error("expected envelope write");
    }
    expect(envelopeWrite.boards).toEqual(nextBoards);
    expect(envelopeWrite.kind).toBe(BOARD_STORAGE_ENVELOPE_KIND);
  });

  test("SC7 projectBoardStorageEntities emits deterministic RepoRecord-compatible records", () => {
    const boards = makeRichBoards();
    const entities = projectBoardStorageEntities(boards, {
      now: "2026-06-03T00:00:00.000Z",
    });

    expect(entities.boards).toHaveLength(boards.length);
    expect(entities.lists).toHaveLength(
      boards.reduce((count, board) => count + board.lists.length, 0),
    );
    expect(entities.cards).toHaveLength(
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
    expect(entities.records[0]!.entityType).toBe("project.board");
    expect(entities.records.every((record) => record.syncScope === "account-sync")).toBe(true);
    expect(entities.records.every((record) => record.schemaVersion === 1)).toBe(true);
  });

  test("SC8 logical card entity preserves full rich card payload plus index fields", () => {
    const boards = makeRichBoards();
    const entities = projectBoardStorageEntities(boards, {
      now: "2026-06-03T00:00:00.000Z",
    });
    const card = entities.cards.find((entry) => entry.cardId === "bc1");
    expect(card).toBeDefined();
    expect(card?.id).toBe("project.card:b-default:b-backlog:bc1");
    expect(card?.projectId).toBe("b-default");
    expect(card?.listId).toBe("b-backlog");
    expect(card?.position).toBe(0);
    expect(card?.archived).toBe(true);
    expect(card?.labelIds).toEqual(boards[0]!.lists[0]!.cards[0]!.labels);
    expect(card?.memberIds).toEqual(boards[0]!.lists[0]!.cards[0]!.members);
    expect(card?.checklistDone).toBe(1);
    expect(card?.checklistTotal).toBe(2);
    expect(card?.startDate).toBe("2026-06-03");
    expect(card?.dueDate).toBe("2026-06-04");
    expect(card?.payload.attachments).toHaveLength(1);
    expect(card?.payload.activity).toHaveLength(1);
  });
});
