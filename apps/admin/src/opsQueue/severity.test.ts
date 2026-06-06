/**
 * opsQueue/severity.test.ts — P3 ops-queue severity contract (row #5).
 *
 * Covers (test.md §1, AC-7):
 *   - TT-OPS-SEVERITY-MAP             : tone(+count)→severity deterministic; SEVERITY_ORDER total
 *   - TT-OPS-SEVERITY-COVERS-ALL-QUEUES : all 6 prototype QUEUES map to a defined severity
 *   - TT-OPS-RANK-DETERMINISTIC       : severityRank total + idempotent on the fixture
 */
import { describe, it, expect } from "vitest";
import {
  toSeverity,
  severityRank,
  SEVERITY_ORDER,
  DANGER_CRITICAL_THRESHOLD,
  type OpsSeverity,
} from "./severity";
import { QUEUES } from "../fixtures";
import type { OpsQueueItem, Tone } from "../adapters/types";

function item(tone: Tone, count: number, key = `${tone}-${count}`): OpsQueueItem {
  return { key, icon: "•", tone, title: key, sub: "", count, rows: [] };
}

describe("TT-OPS-SEVERITY-MAP: deterministic tone(+count)→severity", () => {
  it("SEVERITY_ORDER is a total order (critical > high > warning > info)", () => {
    expect(SEVERITY_ORDER.critical).toBeGreaterThan(SEVERITY_ORDER.high);
    expect(SEVERITY_ORDER.high).toBeGreaterThan(SEVERITY_ORDER.warning);
    expect(SEVERITY_ORDER.warning).toBeGreaterThan(SEVERITY_ORDER.info);
    // exactly 4 severities
    expect(Object.keys(SEVERITY_ORDER).sort()).toEqual(
      ["critical", "high", "info", "warning"].sort(),
    );
  });

  it("danger escalates to critical at/above the pinned threshold, else high", () => {
    expect(toSeverity(item("danger", DANGER_CRITICAL_THRESHOLD))).toBe("critical");
    expect(toSeverity(item("danger", DANGER_CRITICAL_THRESHOLD + 1))).toBe("critical");
    expect(toSeverity(item("danger", DANGER_CRITICAL_THRESHOLD - 1))).toBe("high");
    expect(toSeverity(item("danger", 0))).toBe("high");
  });

  it("warning→warning, info→info, muted→info (deterministic, count-independent)", () => {
    expect(toSeverity(item("warning", 9))).toBe("warning");
    expect(toSeverity(item("warning", 999))).toBe("warning");
    expect(toSeverity(item("info", 37))).toBe("info");
    expect(toSeverity(item("muted", 4))).toBe("info");
    expect(toSeverity(item("muted", 999))).toBe("info");
  });

  it("toSeverity is pure + deterministic (same input → same output)", () => {
    const it1 = item("danger", 14);
    expect(toSeverity(it1)).toBe(toSeverity(it1));
  });
});

describe("TT-OPS-SEVERITY-COVERS-ALL-QUEUES: every prototype queue maps to a defined severity", () => {
  const DEFINED: OpsSeverity[] = ["critical", "high", "warning", "info"];

  it("all 6 QUEUES map to one of the 4 defined severities (none unmapped)", () => {
    expect(QUEUES).toHaveLength(6);
    for (const q of QUEUES) {
      const sev = toSeverity(q);
      expect(DEFINED, `queue "${q.key}" mapped to undefined severity`).toContain(sev);
    }
  });

  it("the documented per-queue mapping holds (risk→critical, highcost→high, …)", () => {
    const byKey = Object.fromEntries(QUEUES.map((q) => [q.key, toSeverity(q)]));
    expect(byKey.risk).toBe("critical"); // danger, count 14 (>= threshold)
    expect(byKey.highcost).toBe("high"); // danger, count 11 (< threshold)
    expect(byKey.dunning).toBe("warning"); // warning, count 9
    expect(byKey.overage).toBe("warning"); // warning, count 6
    expect(byKey.tickets).toBe("info"); // info, count 37
    expect(byKey.dormant).toBe("info"); // muted, count 4
  });
});

describe("TT-OPS-RANK-DETERMINISTIC: severityRank is total + consistent", () => {
  it("severity desc, then count desc", () => {
    // higher severity ranks first regardless of count
    expect(severityRank(item("danger", 1), item("warning", 999))).toBeLessThan(0);
    // same severity → higher count first
    expect(severityRank(item("warning", 9), item("warning", 6))).toBeLessThan(0);
    expect(severityRank(item("warning", 6), item("warning", 9))).toBeGreaterThan(0);
    // identical severity + count → 0 (stable)
    expect(severityRank(item("warning", 6, "a"), item("warning", 6, "b"))).toBe(0);
  });

  it("sorting the same input twice yields identical order (deterministic)", () => {
    const once = QUEUES.slice().sort(severityRank).map((q) => q.key);
    const twice = QUEUES.slice().sort(severityRank).map((q) => q.key);
    expect(once).toEqual(twice);
  });

  it("is antisymmetric on the fixture (sign flips when args swap)", () => {
    // sign() returns canonical -1|0|1; antisymmetry ⇔ sign(ab) + sign(ba) === 0
    // (this also avoids the -0 vs 0 pitfall in the Object.is-based toBe matcher).
    const sign = (n: number): number => (n > 0 ? 1 : n < 0 ? -1 : 0);
    for (let i = 0; i < QUEUES.length; i++) {
      for (let j = 0; j < QUEUES.length; j++) {
        const ab = severityRank(QUEUES[i]!, QUEUES[j]!);
        const ba = severityRank(QUEUES[j]!, QUEUES[i]!);
        expect(sign(ab) + sign(ba)).toBe(0);
      }
    }
  });

  it("produces the documented ranked order over the fixture", () => {
    const order = QUEUES.slice().sort(severityRank).map((q) => q.key);
    expect(order).toEqual([
      "risk", // critical, 14
      "highcost", // high, 11
      "dunning", // warning, 9
      "overage", // warning, 6
      "tickets", // info, 37
      "dormant", // info, 4
    ]);
  });
});
