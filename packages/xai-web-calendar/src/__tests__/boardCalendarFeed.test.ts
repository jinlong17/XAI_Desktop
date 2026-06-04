import { describe, expect, it } from "vitest";
import {
  createBoardStorageEnvelope,
  makeDefaultBoards,
} from "@repo/plugin-web-board-core";
import type { Board } from "@repo/plugin-web-board-core";
import {
  boardCalendarEventsByDate,
  mergeEventsForMonth,
} from "../internal/boardCalendarFeed.js";
import { SAMPLE_EVENTS } from "../internal/sampleEvents.js";

function makeBoardsWithFirstCard(
  patch: Partial<Board["lists"][number]["cards"][number]>,
): Board[] {
  const boards = makeDefaultBoards() as Board[];
  boards[0]!.lists[0]!.cards[0] = {
    ...boards[0]!.lists[0]!.cards[0]!,
    ...patch,
  };
  return boards;
}

describe("boardCalendarEventsByDate", () => {
  it("BCF-1: absent or invalid Board storage produces no feed", () => {
    expect(boardCalendarEventsByDate(null)).toEqual({});
    expect(boardCalendarEventsByDate({ bogus: true })).toEqual({});
  });

  it("BCF-2: raw Board[] projects active dated cards", () => {
    const feed = boardCalendarEventsByDate(
      makeBoardsWithFirstCard({ dueDate: "2026-05-14" }),
    );

    expect(feed["2026-05-14"]?.[0]).toMatchObject({
      c: "blue",
      t: { en: "Onboarding flow concepts", zh: "新人引导流程概念" },
      source: {
        type: "board-card",
        boardId: "b-default",
        listId: "b-backlog",
        cardId: "bc1",
      },
    });
  });

  it("BCF-3: v1 envelope Board storage is accepted", () => {
    const envelope = createBoardStorageEnvelope(
      makeBoardsWithFirstCard({ dueDate: "2026-05-14" }),
      { migratedAt: "2026-06-03T00:00:00.000Z" },
    );

    expect(boardCalendarEventsByDate(envelope)["2026-05-14"]).toHaveLength(1);
  });

  it("BCF-4: archived lists and archived cards are skipped", () => {
    const archivedCardFeed = boardCalendarEventsByDate(
      makeBoardsWithFirstCard({ dueDate: "2026-05-14", archived: true }),
    );
    expect(archivedCardFeed["2026-05-14"]).toBeUndefined();

    const boards = makeBoardsWithFirstCard({ dueDate: "2026-05-14" });
    boards[0]!.lists[0] = { ...boards[0]!.lists[0]!, archived: true };
    expect(boardCalendarEventsByDate(boards)["2026-05-14"]).toBeUndefined();
  });

  it("BCF-5: dueDate wins over startDate", () => {
    const feed = boardCalendarEventsByDate(
      makeBoardsWithFirstCard({
        startDate: "2026-05-13",
        dueDate: "2026-05-14",
      }),
    );

    expect(feed["2026-05-13"]).toBeUndefined();
    expect(feed["2026-05-14"]).toHaveLength(1);
  });
});

describe("mergeEventsForMonth", () => {
  it("BCF-6: preserves sample events first and appends Board feed events", () => {
    const feed = boardCalendarEventsByDate(
      makeBoardsWithFirstCard({ dueDate: "2026-05-01" }),
    );
    const merged = mergeEventsForMonth(SAMPLE_EVENTS, feed, {
      year: 2026,
      month: 5,
    });

    expect(merged[1]?.[0]?.t.en).toBe("Call Sandy");
    expect(merged[1]?.at(-1)?.t.en).toBe("Onboarding flow concepts");
  });
});
