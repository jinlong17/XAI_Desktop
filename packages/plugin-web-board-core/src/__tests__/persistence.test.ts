import { describe, expect, test } from "vitest";
import {
  loadBoardsOrDefault,
  pickActiveBoard,
} from "../internal/persistence.js";
import { makeDefaultBoards } from "../internal/seed/board-data.js";
import { createBoardStorageEnvelope } from "../internal/storageContract.js";

describe("persistence", () => {
  test("PE1 loadBoardsOrDefault(null) returns makeDefaultBoards()", () => {
    const boards = loadBoardsOrDefault(null);
    expect(boards.length).toBeGreaterThan(0);
    // Same shape as the seed
    expect(boards.map((b) => b.id)).toEqual(
      makeDefaultBoards().map((b) => b.id),
    );
  });

  test("PE2 loadBoardsOrDefault(garbage) returns seed", () => {
    expect(loadBoardsOrDefault("garbage").length).toBeGreaterThan(0);
    expect(loadBoardsOrDefault(42).length).toBeGreaterThan(0);
    expect(loadBoardsOrDefault({ foo: "bar" }).length).toBeGreaterThan(0);
    expect(loadBoardsOrDefault([{ id: "x" }]).length).toBeGreaterThan(0);
  });

  test("PE2b loadBoardsOrDefault([]) returns seed (empty array is wipe — refuse)", () => {
    expect(loadBoardsOrDefault([]).length).toBeGreaterThan(0);
  });

  test("PE3 loadBoardsOrDefault(valid) returns the same reference", () => {
    const seed = makeDefaultBoards();
    expect(loadBoardsOrDefault(seed)).toBe(seed);
  });

  test("PE3b loadBoardsOrDefault(v1 envelope) returns envelope boards", () => {
    const seed = makeDefaultBoards();
    const envelope = createBoardStorageEnvelope(seed);
    expect(loadBoardsOrDefault(envelope)).toEqual(seed);
  });

  test("PE4 pickActiveBoard returns matching board by id", () => {
    const seed = makeDefaultBoards();
    expect(pickActiveBoard(seed, "b-pm").id).toBe("b-pm");
  });

  test("PE5 pickActiveBoard with unknown id returns boards[0]", () => {
    const seed = makeDefaultBoards();
    expect(pickActiveBoard(seed, "nonexistent").id).toBe(seed[0]!.id);
  });

  test("PE5b pickActiveBoard with empty id returns boards[0]", () => {
    const seed = makeDefaultBoards();
    expect(pickActiveBoard(seed, "").id).toBe(seed[0]!.id);
  });

  test("PE6 pickActiveBoard with empty boards throws", () => {
    expect(() => pickActiveBoard([], "anything")).toThrow();
  });
});
