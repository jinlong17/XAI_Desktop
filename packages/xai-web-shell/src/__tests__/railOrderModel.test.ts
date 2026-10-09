/**
 * Rail-order pure model — RM-D (A5 domain), RM-V (display reconcile) and
 * RM-P1..P7 (A2 index-slot merge realizing R-1). CP-APPRAIL-01.
 *
 * The expected values below are written from the contract text (A2, A5, §2),
 * never computed by the product helper under test.
 */

import { describe, expect, it } from "vitest";
import { displayRailOrder, isRailOrder, isRailPermutation, mergeRailOrder, sameRailOrder } from "../internal/railOrderModel.js";

const RAIL = ["ai", "tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "bookkeeping", "metrics", "habits", "meditation", "countdown", "statistics"];
const DEFAULTS = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "timetrack", "habits", "meditation", "countdown", "ai", "statistics"];
const TOGGLEABLE = ["tasks", "board", "dashboard", "calendar", "matrix", "pomodoro", "habits", "meditation"];
const visible = (hidden: readonly string[]) => RAIL.filter((id) => !hidden.includes(id));

/** Moves `from` to the index of `to` (the dnd.ts splice semantics), written here. */
function move(items: readonly string[], from: string, to: string): string[] {
  const next = [...items];
  const fromIndex = next.indexOf(from);
  const toIndex = next.indexOf(to);
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, from);
  return next;
}

/** Checks P1–P4 for one merge. */
function properties(stored: readonly string[], rail: readonly string[], order: readonly string[], merged: readonly string[]): string[] {
  const failures: string[] = [];
  if (!isRailOrder(merged)) failures.push("P3 domain");
  if (JSON.stringify(merged.filter((id) => rail.includes(id))) !== JSON.stringify(order)) failures.push("P1");
  stored.forEach((id, index) => { if (!rail.includes(id) && merged[index] !== id) failures.push(`P2 ${id}@${index}`); });
  const union = new Set([...stored, ...rail]);
  if (merged.length !== union.size || !merged.every((id) => union.has(id))) failures.push("P3 union");
  if (merged.length !== stored.length + rail.filter((id) => !stored.includes(id)).length) failures.push("P4");
  return failures;
}

describe("RM-D — strict A5 domain (refuse, never repair)", () => {
  it.each([
    ["[]", []],
    ["the defaults", DEFAULTS],
    ["unknown, settings and empty-string ids", ["ghost-module", "settings", "", "tasks"]],
  ])("RM-D1 — %s is in-domain", (_name, value) => {
    expect(isRailOrder(value)).toBe(true);
  });

  it.each([
    "{}", '{"tasks":1}', "1", "0", "-1", "true", "false", '"tasks"', "[1]", '["tasks",2]', "[null]", '[["tasks"]]',
    '["tasks","tasks"]', '["board","tasks","board"]', "null",
  ])("RM-D2 — the decoded bytes %s are invalid", (bytes) => {
    expect(isRailOrder(JSON.parse(bytes))).toBe(false);
  });

  it("RM-D3 — a sparse array or undefined is invalid", () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(isRailOrder(["tasks", , "board"])).toBe(false);
    expect(isRailOrder(undefined)).toBe(false);
  });
});

describe("RM-V — display reconcile D(S, R) (contract §2, unchanged)", () => {
  it("RM-V1 — absent bytes display the 12 defaults, then Bookkeeping and Metrics", () => {
    expect(displayRailOrder(DEFAULTS, RAIL)).toEqual([...DEFAULTS, "bookkeeping", "metrics"]);
  });
  it("RM-V2 — [] displays R order", () => {
    expect(displayRailOrder([], RAIL)).toEqual(RAIL);
  });
  it("RM-V3 — hidden, unknown and non-rail ids are skipped; missing visible ids are appended in R order", () => {
    expect(displayRailOrder(["ghost-module", "dashboard", "settings", "board", "tasks"], visible(["board"])))
      .toEqual(["dashboard", "tasks", ...visible(["board"]).filter((id) => id !== "dashboard" && id !== "tasks")]);
  });
  it("RM-V4 — permutation and equality helpers", () => {
    expect(isRailPermutation(["b", "a"], ["a", "b"])).toBe(true);
    expect(isRailPermutation(["a", "a"], ["a", "b"])).toBe(false);
    expect(isRailPermutation(["a"], ["a", "b"])).toBe(false);
    expect(sameRailOrder(["a", "b"], ["a", "b"])).toBe(true);
    expect(sameRailOrder(["b", "a"], ["a", "b"])).toBe(false);
  });
});

describe("RM-P — A2 index-slot merge (R-1)", () => {
  it("RM-P1..P4 — each of the eight toggleable modules hidden in turn keeps its stored index", () => {
    const stored = [...RAIL].reverse();
    for (const hidden of TOGGLEABLE) {
      const rail = visible([hidden]);
      const shown = displayRailOrder(stored, rail);
      const order = move(shown, shown[0]!, shown[4]!);
      const merged = mergeRailOrder(stored, rail, order);
      expect(merged, hidden).not.toBeNull();
      expect(properties(stored, rail, order, merged!), hidden).toEqual([]);
      expect(merged!.indexOf(hidden), `${hidden} keeps its index`).toBe(stored.indexOf(hidden));
    }
  });

  it("RM-P2 — three hidden modules each keep their stored index", () => {
    const stored = [...RAIL].reverse();
    const hidden = ["board", "habits", "pomodoro"];
    const rail = visible(hidden);
    const shown = displayRailOrder(stored, rail);
    const order = move(shown, shown[0]!, shown[6]!);
    const merged = mergeRailOrder(stored, rail, order)!;
    expect(properties(stored, rail, order, merged)).toEqual([]);
    for (const id of hidden) expect(merged.indexOf(id), id).toBe(stored.indexOf(id));
  });

  it("RM-P2 — unknown ids and settings keep their stored index", () => {
    const stored = ["tasks", "ghost-module", "dashboard", "settings", ...RAIL.filter((id) => id !== "tasks" && id !== "dashboard")];
    const shown = displayRailOrder(stored, RAIL);
    const order = move(shown, "tasks", "calendar");
    const merged = mergeRailOrder(stored, RAIL, order)!;
    expect(properties(stored, RAIL, order, merged)).toEqual([]);
    expect(merged[1]).toBe("ghost-module");
    expect(merged[3]).toBe("settings");
  });

  it("RM-P5 — the only hidden module returns to exactly its previous place when re-enabled", () => {
    const stored = ["calendar", "tasks", "board", ...RAIL.filter((id) => !["calendar", "tasks", "board"].includes(id))];
    const rail = visible(["board"]);
    const shown = displayRailOrder(stored, rail);
    const order = move(shown, "calendar", "matrix");
    const merged = mergeRailOrder(stored, rail, order)!;
    expect(merged[2]).toBe("board");
    const reenabled = displayRailOrder(merged, RAIL);
    expect(reenabled.indexOf("board")).toBe(2);
    expect(reenabled.filter((id) => id !== "board")).toEqual(order);
  });

  it("RM-P6 — with every stored id visible the merge equals the dropped order (today's bytes)", () => {
    const stored = [...RAIL].reverse();
    const order = move(stored, stored[0]!, stored[3]!);
    expect(mergeRailOrder(stored, RAIL, order)).toEqual(order);
    const absentOrder = move(displayRailOrder(DEFAULTS, RAIL), "tasks", "calendar");
    const overDefaults = mergeRailOrder(DEFAULTS, RAIL, absentOrder)!;
    expect(overDefaults).toEqual(absentOrder);
    const emptyOrder = move(RAIL, "ai", "matrix");
    expect(mergeRailOrder([], RAIL, emptyOrder)).toEqual(emptyOrder);
  });

  it("RM-P7 — over absent bytes a hidden default module keeps its default index", () => {
    const rail = visible(["board"]);
    const order = move(displayRailOrder(DEFAULTS, rail), "tasks", "matrix");
    const merged = mergeRailOrder(DEFAULTS, rail, order)!;
    expect(merged[1]).toBe("board");
    expect(properties(DEFAULTS, rail, order, merged)).toEqual([]);
  });

  it("RM-P8 — a non-permutation, a duplicate or a malformed stored order gives no merge", () => {
    const stored = [...RAIL].reverse();
    expect(mergeRailOrder(stored, RAIL, stored.slice(1))).toBeNull();
    expect(mergeRailOrder(stored, RAIL, [...stored.slice(1), stored[1]!])).toBeNull();
    expect(mergeRailOrder(stored, visible(["board"]), stored)).toBeNull();
    expect(mergeRailOrder(["tasks", "tasks"] as string[], RAIL, RAIL)).toBeNull();
  });
});
