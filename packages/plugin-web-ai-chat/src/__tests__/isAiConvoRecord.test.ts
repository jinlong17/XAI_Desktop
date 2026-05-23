/**
 * isAiConvoRecord predicate tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — V
 */

import { describe, it, expect } from "vitest";
import { isAiConvoRecord } from "../internal/isAiConvoRecord.js";

describe("isAiConvoRecord (V)", () => {
  it("V1: returns true for { id, title, time } with strings", () => {
    expect(isAiConvoRecord({ id: "c1", title: "Hello", time: "Today" })).toBe(true);
  });

  it("V2: returns false for null / undefined / array / number / string", () => {
    expect(isAiConvoRecord(null)).toBe(false);
    expect(isAiConvoRecord(undefined)).toBe(false);
    expect(isAiConvoRecord([])).toBe(false);
    expect(isAiConvoRecord(42)).toBe(false);
    expect(isAiConvoRecord("c1")).toBe(false);
  });

  it("V3: returns false if id is missing or non-string", () => {
    expect(isAiConvoRecord({ title: "t", time: "t" })).toBe(false);
    expect(isAiConvoRecord({ id: 1, title: "t", time: "t" })).toBe(false);
  });

  it("V4: returns false if title is missing or non-string", () => {
    expect(isAiConvoRecord({ id: "c1", time: "t" })).toBe(false);
    expect(isAiConvoRecord({ id: "c1", title: 1, time: "t" })).toBe(false);
  });

  it("V5: returns false if time is missing or non-string", () => {
    expect(isAiConvoRecord({ id: "c1", title: "t" })).toBe(false);
    expect(isAiConvoRecord({ id: "c1", title: "t", time: 1 })).toBe(false);
  });

  it("V6: extra properties allowed", () => {
    expect(isAiConvoRecord({ id: "c1", title: "t", time: "t", foo: 1 })).toBe(true);
  });

  it("V7: empty title/time allowed; empty id rejected", () => {
    expect(isAiConvoRecord({ id: "c1", title: "", time: "" })).toBe(true);
    expect(isAiConvoRecord({ id: "", title: "t", time: "t" })).toBe(false);
  });
});
