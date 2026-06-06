/**
 * opsQueue/opsQueueReadModel.test.ts — P3 severity-ranked read model (row #5).
 *
 * Covers (test.md §1, AC-8):
 *   - TT-OPS-READMODEL-RANKED         : ranked() severity desc then count desc; top = highest
 *   - TT-OPS-STABLE-SORT              : equal severity+count preserve input order
 *   - TT-OPS-READMODEL-CONTRACT-SHAPE : preserves OpsQueueItem shape + adds defined severity;
 *                                       count out === count in (reorder, never drop/add)
 */
import { describe, it, expect } from "vitest";
import { createOpsQueueReadModel } from "./opsQueueReadModel";
import { toSeverity, SEVERITY_ORDER } from "./severity";
import { QUEUES } from "../fixtures";
import type { OpsQueueItem, Tone } from "../adapters/types";

function item(tone: Tone, count: number, key: string): OpsQueueItem {
  return { key, icon: "•", tone, title: key, sub: "s", count, rows: [{ title: "t", detail: "d", meta: "m" }] };
}

describe("TT-OPS-READMODEL-RANKED: severity desc then count desc", () => {
  it("default source (overviewAdapter.getOpsQueue) → documented ranked order", () => {
    const ranked = createOpsQueueReadModel().ranked();
    expect(ranked.map((r) => r.key)).toEqual([
      "risk",
      "highcost",
      "dunning",
      "overage",
      "tickets",
      "dormant",
    ]);
    // top item is the highest-severity queue from the fixture
    expect(ranked[0]!.key).toBe("risk");
    expect(ranked[0]!.severity).toBe("critical");
  });

  it("output severities are monotonically non-increasing", () => {
    const ranked = createOpsQueueReadModel().ranked();
    for (let i = 1; i < ranked.length; i++) {
      const prev = SEVERITY_ORDER[ranked[i - 1]!.severity];
      const cur = SEVERITY_ORDER[ranked[i]!.severity];
      expect(prev).toBeGreaterThanOrEqual(cur);
      // within equal severity, count is non-increasing
      if (prev === cur) {
        expect(ranked[i - 1]!.count).toBeGreaterThanOrEqual(ranked[i]!.count);
      }
    }
  });

  it("explicit source is ranked the same way (severity desc, count desc)", () => {
    const src = [
      item("info", 100, "i-low"),
      item("danger", 20, "d-crit"),
      item("warning", 5, "w-a"),
      item("danger", 3, "d-high"),
    ];
    const ranked = createOpsQueueReadModel(src).ranked();
    expect(ranked.map((r) => r.key)).toEqual(["d-crit", "d-high", "w-a", "i-low"]);
    expect(ranked.map((r) => r.severity)).toEqual(["critical", "high", "warning", "info"]);
  });
});

describe("TT-OPS-STABLE-SORT: equal severity + count preserve input order", () => {
  it("ties keep input order (stable)", () => {
    const src = [
      item("warning", 6, "w1"),
      item("warning", 6, "w2"),
      item("warning", 6, "w3"),
    ];
    const ranked = createOpsQueueReadModel(src).ranked();
    expect(ranked.map((r) => r.key)).toEqual(["w1", "w2", "w3"]);
  });

  it("muted and info both → info; equal count keeps input order", () => {
    const src = [item("info", 4, "info4"), item("muted", 4, "muted4")];
    const ranked = createOpsQueueReadModel(src).ranked();
    expect(ranked.map((r) => r.key)).toEqual(["info4", "muted4"]);
    expect(ranked.every((r) => r.severity === "info")).toBe(true);
  });
});

describe("TT-OPS-READMODEL-CONTRACT-SHAPE: preserves OpsQueueItem + adds severity, no drop/add", () => {
  it("each RankedOpsQueueItem keeps all original OpsQueueItem fields + a defined severity", () => {
    const ranked = createOpsQueueReadModel().ranked();
    for (const r of ranked) {
      // original OpsQueueItem fields intact
      for (const f of ["key", "icon", "tone", "title", "sub", "count", "rows"]) {
        expect(r, `missing field ${f}`).toHaveProperty(f);
      }
      expect(Array.isArray(r.rows)).toBe(true);
      // added severity, defined + consistent with toSeverity
      expect(["critical", "high", "warning", "info"]).toContain(r.severity);
      expect(r.severity).toBe(toSeverity(r));
    }
  });

  it("count of output === count of input (reorders, never drops/adds)", () => {
    expect(createOpsQueueReadModel().ranked()).toHaveLength(QUEUES.length);
    const src = [item("info", 1, "a"), item("danger", 2, "b")];
    expect(createOpsQueueReadModel(src).ranked()).toHaveLength(src.length);
  });

  it("ranked() does NOT mutate the source array", () => {
    const src = [item("info", 1, "a"), item("danger", 2, "b")];
    const order = src.map((s) => s.key);
    createOpsQueueReadModel(src).ranked();
    expect(src.map((s) => s.key)).toEqual(order); // source unchanged
  });

  it("the returned items are copies (mutating output does not change a re-read)", () => {
    const rm = createOpsQueueReadModel();
    const first = rm.ranked();
    first[0]!.count = -999;
    const second = rm.ranked();
    expect(second[0]!.count).not.toBe(-999);
  });
});
