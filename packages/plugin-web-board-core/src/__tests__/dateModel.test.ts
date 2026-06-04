import { describe, expect, test } from "vitest";
import {
  compareIsoDateOnly,
  getBoardCardDateCompatibilityPatch,
  getBoardCardDateMeta,
  isoDateFromOffset,
  isIsoDateOnly,
  normalizeBoardCardDates,
} from "../internal/dateModel.js";
import type { BoardCard } from "../types.js";

function makeCard(extra: Partial<BoardCard> = {}): BoardCard {
  return {
    id: "c1",
    title: { en: "Card", zh: "卡片" },
    ...extra,
  };
}

describe("dateModel", () => {
  test("DM1 validates real ISO date-only values, not just the YYYY-MM-DD shape", () => {
    expect(isIsoDateOnly("2026-06-03")).toBe(true);
    expect(isIsoDateOnly("2026-02-31")).toBe(false);
    expect(isIsoDateOnly("2026-13-01")).toBe(false);
    expect(isIsoDateOnly("06/03/2026")).toBe(false);
  });

  test("DM2 infers recoverable legacy M/D values with the frozen Dec/Jan rollover rule", () => {
    expect(
      getBoardCardDateMeta(makeCard({ due: "12/31" }), {
        now: new Date(2026, 0, 2, 9),
      }).dueDate,
    ).toBe("2025-12-31");

    expect(
      getBoardCardDateMeta(makeCard({ due: "1/1" }), {
        now: new Date(2026, 11, 31, 9),
      }).dueDate,
    ).toBe("2027-01-01");

    expect(
      getBoardCardDateMeta(makeCard({ due: "5/26" }), {
        now: new Date(2026, 5, 15, 9),
      }).dueDate,
    ).toBe("2026-05-26");
  });

  test("DM3 treats Today and ambiguous legacy values differently", () => {
    const now = new Date(2026, 5, 3, 9);
    const today = getBoardCardDateMeta(makeCard({ due: "今天", dueEn: "Today" }), {
      now,
    });
    expect(today.dueDate).toBe("2026-06-03");
    expect(today.dueLabel).toEqual({ en: "Today", zh: "今天" });
    expect(today.isDueToday).toBe(true);
    expect(today.dueSource).toBe("legacy-recoverable");

    const ambiguous = getBoardCardDateMeta(
      makeCard({ due: "过期", dueEn: "Overdue", dueLate: true }),
      { now },
    );
    expect(ambiguous.dueDate).toBeUndefined();
    expect(ambiguous.dueLabel).toEqual({ en: "Overdue", zh: "过期" });
    expect(ambiguous.isOverdue).toBe(false);
    expect(ambiguous.isLegacyAmbiguous).toBe(true);
    expect(ambiguous.dueSource).toBe("legacy-ambiguous");
  });

  test("DM4 derives dueDate-only state and invalid-range state from typed dates", () => {
    const now = new Date(2026, 5, 3, 9);
    const meta = getBoardCardDateMeta(
      makeCard({ startDate: "2026-06-05", dueDate: "2026-06-03" }),
      { now },
    );
    expect(meta.startDate).toBe("2026-06-05");
    expect(meta.dueDate).toBe("2026-06-03");
    expect(meta.isDueToday).toBe(true);
    expect(meta.isOverdue).toBe(false);
    expect(meta.isInvalidRange).toBe(true);

    const overdue = getBoardCardDateMeta(makeCard({ dueDate: "2026-06-02" }), {
      now,
    });
    expect(overdue.isOverdue).toBe(true);
    expect(overdue.isWithinWeek).toBe(false);

    const upcoming = getBoardCardDateMeta(makeCard({ dueDate: "2026-06-07" }), {
      now,
    });
    expect(upcoming.isWithinWeek).toBe(true);
  });

  test("DM5 normalizes recoverable legacy dates in memory without mutating the source card", () => {
    const card = makeCard({ due: "5/26" });
    const next = normalizeBoardCardDates(card, {
      now: new Date(2026, 5, 3, 9),
    });
    expect(next.dueDate).toBe("2026-05-26");
    expect(card.dueDate).toBeUndefined();
  });

  test("DM6 compatibility patch dual-writes legacy fields only for explicit date edits", () => {
    const todayPatch = getBoardCardDateCompatibilityPatch(
      { dueDate: "2026-06-03" },
      { now: new Date(2026, 5, 3, 9) },
    );
    expect(todayPatch).toEqual({
      dueDate: "2026-06-03",
      due: "今天",
      dueEn: "Today",
      dueLate: false,
    });

    const startPatch = getBoardCardDateCompatibilityPatch(
      { startDate: "2026-06-04" },
      { now: new Date(2026, 5, 3, 9) },
    );
    expect(startPatch).toEqual({
      startDate: "2026-06-04",
      start: "6/4",
    });

    const clearPatch = getBoardCardDateCompatibilityPatch({ dueDate: undefined });
    expect(clearPatch).toEqual({
      dueDate: undefined,
      due: undefined,
      dueEn: undefined,
      dueLate: undefined,
    });
  });

  test("DM7 exposes local date offsets and ISO comparison helpers for downstream views", () => {
    expect(isoDateFromOffset(1, new Date(2026, 5, 3, 9))).toBe("2026-06-04");
    expect(compareIsoDateOnly("2026-06-04", "2026-06-03")).toBeGreaterThan(0);
  });
});
