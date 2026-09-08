/**
 * G1..G12 — boundary narrowing guards.
 */

import { describe, it, expect } from "vitest";
import { isBoardPanelState, isInboxCardArray } from "../internal/guards.js";

describe("isBoardPanelState (G1..G5)", () => {
  it("G1: null → false", () => {
    expect(isBoardPanelState(null)).toBe(false);
  });

  it("G2: empty object → false", () => {
    expect(isBoardPanelState({})).toBe(false);
  });

  it("G3: partial object (missing planner+board) → false", () => {
    expect(isBoardPanelState({ inbox: true })).toBe(false);
  });

  it("G4: all-keys-booleans → true", () => {
    expect(isBoardPanelState({ inbox: true, planner: false, board: true })).toBe(true);
  });

  it("G5: values are numbers, not booleans → false", () => {
    expect(isBoardPanelState({ inbox: 1, planner: 0, board: 1 })).toBe(false);
  });
});

describe("isInboxCardArray (G6..G12)", () => {
  it("G6: null → false", () => {
    expect(isInboxCardArray(null)).toBe(false);
  });

  it("G7: empty array → true", () => {
    expect(isInboxCardArray([])).toBe(true);
  });

  it("G8: missing text → false", () => {
    expect(isInboxCardArray([{ id: "x" }])).toBe(false);
  });

  it("G9: complete element → true", () => {
    expect(isInboxCardArray([{ id: "x", text: { en: "a", zh: "b" } }])).toBe(true);
  });

  it("G10: id is a number → false", () => {
    expect(isInboxCardArray([{ id: 1, text: { en: "a", zh: "b" } }])).toBe(false);
  });

  it("G11: text missing zh → false", () => {
    expect(isInboxCardArray([{ id: "x", text: { en: "a" } }])).toBe(false);
  });

  it("G12: garbage string → false", () => {
    expect(isInboxCardArray("garbage")).toBe(false);
  });
});
