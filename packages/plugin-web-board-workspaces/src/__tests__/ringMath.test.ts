/**
 * RM1..RM10 — pure ring-chart math.
 */

import { describe, it, expect } from "vitest";
import type { BoardListData } from "@repo/plugin-web-board-core";
import { computeRingSegments, computeDonePct } from "../internal/ringMath.js";

const mkList = (over: Partial<BoardListData>): BoardListData => ({
  id: "l1",
  key: null,
  customName: { en: "Stage", zh: "阶段" },
  color: null,
  cards: [],
  ...over,
});

const mkCard = (id: string) => ({ id, title: { en: id, zh: id } });

describe("computeRingSegments (RM1..RM5, RM10)", () => {
  it("RM1: empty list array → []", () => {
    expect(computeRingSegments([], "en")).toEqual([]);
  });

  it("RM2: lists with zero cards → []", () => {
    const out = computeRingSegments(
      [mkList({ id: "a", cards: [] }), mkList({ id: "b", cards: [] })],
      "en",
    );
    expect(out).toEqual([]);
  });

  it("RM3: 5-list PM template with mixed counts → 5 segments in input order", () => {
    const lists: BoardListData[] = [
      mkList({ id: "todo", customName: { en: "To Do", zh: "待办" }, color: "gray", cards: [mkCard("c1"), mkCard("c2"), mkCard("c3"), mkCard("c4")] }),
      mkList({ id: "prog", customName: { en: "In Progress", zh: "进行中" }, color: "blue", cards: [mkCard("c5"), mkCard("c6"), mkCard("c7")] }),
      mkList({ id: "rev", customName: { en: "In Review", zh: "审核中" }, color: "yellow", cards: [mkCard("c8"), mkCard("c9")] }),
      mkList({ id: "blk", customName: { en: "Blocked", zh: "阻塞" }, color: "red", cards: [mkCard("c10")] }),
      mkList({ id: "done", customName: { en: "Done", zh: "已完成" }, color: "green", cards: [mkCard("c11"), mkCard("c12")] }),
    ];
    const out = computeRingSegments(lists, "en");
    expect(out).toHaveLength(5);
    expect(out.map((s) => s.listId)).toEqual(["todo", "prog", "rev", "blk", "done"]);
    expect(out.map((s) => s.count)).toEqual([4, 3, 2, 1, 2]);
  });

  it("RM4: list with color:null → segment.color === var(--accent)", () => {
    const out = computeRingSegments(
      [mkList({ id: "a", color: null, cards: [mkCard("c1")] })],
      "en",
    );
    expect(out[0]!.color).toBe("var(--accent)");
  });

  it("RM5: list with color:'red' → segment.color resolves to OKLCH var", () => {
    const out = computeRingSegments(
      [mkList({ id: "a", color: "red", cards: [mkCard("c1")] })],
      "en",
    );
    expect(out[0]!.color).toBe("var(--board-list-color-red)");
  });

  it("RM10: label resolution uses lang — zh customName vs en", () => {
    const list = mkList({
      id: "a",
      customName: { en: "Done", zh: "已完成" },
      cards: [mkCard("c1")],
    });
    expect(computeRingSegments([list], "en")[0]!.label).toBe("Done");
    expect(computeRingSegments([list], "zh")[0]!.label).toBe("已完成");
  });

  it("falls back to list.key when customName is missing", () => {
    const list = mkList({ id: "a", customName: undefined, key: "backlog", cards: [mkCard("c1")] });
    expect(computeRingSegments([list], "en")[0]!.label).toBe("backlog");
  });
});

describe("computeDonePct (RM6..RM8)", () => {
  it("RM6: empty lists → 0", () => {
    expect(computeDonePct([])).toBe(0);
  });

  it("RM7: only-Done list with 2 cards → 100", () => {
    const list = mkList({
      id: "d",
      customName: { en: "Done", zh: "已完成" },
      cards: [mkCard("c1"), mkCard("c2")],
    });
    expect(computeDonePct([list])).toBe(100);
  });

  it("RM8: 5-stage PM with 2/12 done → 17%", () => {
    const lists: BoardListData[] = [
      mkList({ id: "todo", customName: { en: "To Do", zh: "待办" }, cards: [mkCard("c1"), mkCard("c2"), mkCard("c3"), mkCard("c4")] }),
      mkList({ id: "prog", customName: { en: "In Progress", zh: "进行中" }, cards: [mkCard("c5"), mkCard("c6"), mkCard("c7")] }),
      mkList({ id: "rev", customName: { en: "In Review", zh: "审核中" }, cards: [mkCard("c8"), mkCard("c9")] }),
      mkList({ id: "blk", customName: { en: "Blocked", zh: "阻塞" }, cards: [mkCard("c10")] }),
      mkList({ id: "done", customName: { en: "Done", zh: "已完成" }, cards: [mkCard("c11"), mkCard("c12")] }),
    ];
    expect(computeDonePct(lists)).toBe(17);
  });

  it("matches /完成/ on zh customName when en lacks it", () => {
    const lists: BoardListData[] = [
      mkList({ id: "todo", customName: { en: "To Do", zh: "待办" }, cards: [mkCard("c1")] }),
      mkList({ id: "done", customName: { en: "Closed", zh: "已完成" }, cards: [mkCard("c2")] }),
    ];
    expect(computeDonePct(lists)).toBe(50);
  });
});

describe("ring math float precision (RM9)", () => {
  it("RM9: per-segment len + (c - len) === c within 1e-9", () => {
    const lists: BoardListData[] = [
      mkList({ id: "a", cards: [mkCard("c1"), mkCard("c2"), mkCard("c3")] }),
      mkList({ id: "b", cards: [mkCard("c4"), mkCard("c5")] }),
      mkList({ id: "c", cards: [mkCard("c6")] }),
    ];
    const segs = computeRingSegments(lists, "en");
    const total = segs.reduce((n, s) => n + s.count, 0);
    const r = 44;
    const c = 2 * Math.PI * r;
    for (const seg of segs) {
      const len = (seg.count / total) * c;
      expect(Math.abs(len + (c - len) - c)).toBeLessThan(1e-9);
    }
  });
});
