import { describe, expect, test } from "vitest";
import {
  createBoardCardActivityNote,
  createBoardCardComment,
} from "../index.js";

describe("activityEntries", () => {
  test("ACT-1 creates trimmed comment entries with author metadata", () => {
    const result = createBoardCardComment({
      id: " c1 ",
      body: " Looks good ",
      createdAt: "2026-06-03T23:40:00.000Z",
      authorId: " u1 ",
      authorName: " Alice ",
    });

    expect(result.status).toBe("valid");
    if (result.status !== "valid") throw new Error("expected valid result");
    expect(result.entry).toEqual({
      id: "c1",
      kind: "comment",
      body: "Looks good",
      createdAt: "2026-06-03T23:40:00.000Z",
      authorId: "u1",
      authorName: "Alice",
    });
  });

  test("ACT-2 creates backward-compatible note entries", () => {
    const result = createBoardCardActivityNote({
      id: "n1",
      body: "Moved to review",
      createdAt: "2026-06-03T23:40:00.000Z",
    });

    expect(result.status).toBe("valid");
    if (result.status !== "valid") throw new Error("expected valid result");
    expect(result.entry.kind).toBe("note");
    expect(result.entry.body).toBe("Moved to review");
  });

  test("ACT-3 rejects missing ids, empty bodies, and missing timestamps", () => {
    expect(
      createBoardCardComment({
        id: "",
        body: "Comment",
        createdAt: "2026-06-03T23:40:00.000Z",
      }),
    ).toEqual({ status: "invalid", reason: "missing-id" });

    expect(
      createBoardCardComment({
        id: "c1",
        body: " ",
        createdAt: "2026-06-03T23:40:00.000Z",
      }),
    ).toEqual({ status: "invalid", reason: "empty-body" });

    expect(
      createBoardCardComment({
        id: "c1",
        body: "Comment",
        createdAt: "",
      }),
    ).toEqual({ status: "invalid", reason: "missing-created-at" });
  });
});
