/**
 * AC-PERSIST-1..7: pure sanitize reconciliation logic.
 */
import { describe, expect, it } from "vitest";

import { arraysEqual, sanitizeOrder } from "../internal/sanitizeOrder.js";
import type { WidgetRegistration } from "../types.js";

function fixture(id: string): WidgetRegistration {
  return { id, span: "w-stat", render: () => null };
}

describe("sanitizeOrder", () => {
  it("AC-PERSIST-1: empty persisted → empty order", () => {
    const reg = [fixture("a"), fixture("b"), fixture("c")];
    expect(sanitizeOrder([], reg)).toEqual([]);
  });

  it("AC-PERSIST-2: persisted matches registered → identity (pure)", () => {
    const reg = [fixture("a"), fixture("b"), fixture("c")];
    expect(sanitizeOrder(["a", "b", "c"], reg)).toEqual(["a", "b", "c"]);
  });

  it("AC-PERSIST-3: persisted contains unknown id → drop unknown", () => {
    const reg = [fixture("a"), fixture("b")];
    expect(sanitizeOrder(["a", "ghost", "b"], reg)).toEqual(["a", "b"]);
  });

  it("AC-PERSIST-4: persisted missing some registered → preserves user removals", () => {
    const reg = [fixture("a"), fixture("b"), fixture("c"), fixture("d")];
    expect(sanitizeOrder(["a", "c"], reg)).toEqual(["a", "c"]);
  });

  it("AC-PERSIST-5: persisted contains duplicate id → dedupe (first wins)", () => {
    const reg = [fixture("a"), fixture("b")];
    expect(sanitizeOrder(["a", "a", "b"], reg)).toEqual(["a", "b"]);
  });

  it("AC-PERSIST-6: empty registered → empty output regardless of persisted", () => {
    expect(sanitizeOrder([], [])).toEqual([]);
    expect(sanitizeOrder(["a", "b", "c"], [])).toEqual([]);
  });

  it("AC-PERSIST-7: pure — same input → same output (referential stability not required, deep-equal is)", () => {
    const reg = [fixture("a"), fixture("b")];
    const out1 = sanitizeOrder(["b", "a"], reg);
    const out2 = sanitizeOrder(["b", "a"], reg);
    expect(out1).toEqual(out2);
    expect(out1).toEqual(["b", "a"]);
  });

  it("preserves the persisted custom order for known ids", () => {
    const reg = [fixture("a"), fixture("b"), fixture("c")];
    expect(sanitizeOrder(["c", "a", "b"], reg)).toEqual(["c", "a", "b"]);
  });

  it("handles all-unknown persisted gracefully", () => {
    const reg = [fixture("a"), fixture("b")];
    expect(sanitizeOrder(["x", "y", "z"], reg)).toEqual([]);
  });

  it("combination: dedupe + drop without append", () => {
    const reg = [fixture("a"), fixture("b"), fixture("c")];
    expect(sanitizeOrder(["b", "b", "ghost", "a"], reg)).toEqual(["b", "a"]);
  });
});

describe("arraysEqual", () => {
  it("returns true for identical arrays", () => {
    expect(arraysEqual([], [])).toBe(true);
    expect(arraysEqual(["a"], ["a"])).toBe(true);
    expect(arraysEqual(["a", "b"], ["a", "b"])).toBe(true);
  });

  it("returns false for length mismatch", () => {
    expect(arraysEqual(["a"], ["a", "b"])).toBe(false);
    expect(arraysEqual(["a", "b"], ["a"])).toBe(false);
  });

  it("returns false for order mismatch", () => {
    expect(arraysEqual(["a", "b"], ["b", "a"])).toBe(false);
  });

  it("returns false for content mismatch", () => {
    expect(arraysEqual(["a"], ["b"])).toBe(false);
  });
});
