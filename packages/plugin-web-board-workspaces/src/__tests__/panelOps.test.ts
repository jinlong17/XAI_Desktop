/**
 * PO1..PO16 — load / toggle panel + load inbox ops.
 *
 * See api.md §1 (Persistence narrowing contract) for the protocol.
 */

import { describe, it, expect } from "vitest";
import {
  DEFAULT_PANEL_STATE,
  INBOX_SEED,
  loadPanelsOrDefault,
  loadInboxOrDefault,
  togglePanelInvariant,
  isSinglePanelOpen,
} from "../internal/panelOps.js";

describe("loadPanelsOrDefault (PO1..PO8)", () => {
  it("PO1: null → seed", () => {
    expect(loadPanelsOrDefault(null)).toEqual(DEFAULT_PANEL_STATE);
  });

  it("PO2: undefined → seed", () => {
    expect(loadPanelsOrDefault(undefined)).toEqual(DEFAULT_PANEL_STATE);
  });

  it("PO3: empty array (registry default) → seed", () => {
    expect(loadPanelsOrDefault([])).toEqual(DEFAULT_PANEL_STATE);
  });

  it("PO4: garbage string → seed", () => {
    expect(loadPanelsOrDefault("garbage")).toEqual(DEFAULT_PANEL_STATE);
  });

  it("PO5: canonical length-1 array → returns inner object", () => {
    const out = loadPanelsOrDefault([{ inbox: true, planner: false, board: false }]);
    expect(out).toEqual({ inbox: true, planner: false, board: false });
  });

  it("PO6: bare object (legacy prototype shape) → returns object", () => {
    const out = loadPanelsOrDefault({ inbox: true, planner: false, board: false });
    expect(out).toEqual({ inbox: true, planner: false, board: false });
  });

  it("PO7: all-false → invariant forces board:true", () => {
    expect(
      loadPanelsOrDefault([{ inbox: false, planner: false, board: false }]),
    ).toEqual(DEFAULT_PANEL_STATE);
  });

  it("PO8: malformed inner object (missing keys) → seed", () => {
    expect(loadPanelsOrDefault([{ inbox: true }])).toEqual(DEFAULT_PANEL_STATE);
  });
});

describe("loadInboxOrDefault (PO9..PO12)", () => {
  it("PO9: null → 3-item seed", () => {
    const out = loadInboxOrDefault(null);
    expect(out).toHaveLength(3);
    expect(out[0]!.id).toBe("ix1");
    expect(out[1]!.id).toBe("ix2");
    expect(out[2]!.id).toBe("ix3");
  });

  it("PO10: empty array → empty array", () => {
    expect(loadInboxOrDefault([])).toEqual([]);
  });

  it("PO11: valid typed array → passes through", () => {
    const arr = [{ id: "x", text: { en: "a", zh: "b" } }];
    expect(loadInboxOrDefault(arr)).toEqual(arr);
  });

  it("PO12: garbage → seed", () => {
    const out = loadInboxOrDefault("garbage");
    expect(out).toHaveLength(3);
    expect(out[0]!.text.en).toContain("Capture");
  });
});

describe("togglePanelInvariant (PO13..PO16)", () => {
  it("PO13: toggling the only open panel off forces board:true", () => {
    const out = togglePanelInvariant(
      { inbox: true, planner: false, board: false },
      "inbox",
    );
    expect(out).toEqual({ inbox: false, planner: false, board: true });
  });

  it("PO14: toggling one of two open panels leaves invariant satisfied", () => {
    const out = togglePanelInvariant(
      { inbox: true, planner: true, board: false },
      "inbox",
    );
    expect(out).toEqual({ inbox: false, planner: true, board: false });
  });

  it("PO15: toggling board off when it is the only open panel forces board:true", () => {
    const out = togglePanelInvariant(
      { inbox: false, planner: false, board: true },
      "board",
    );
    expect(out).toEqual({ inbox: false, planner: false, board: true });
  });

  it("PO16: toggling board off when others are open leaves invariant satisfied", () => {
    const out = togglePanelInvariant(
      { inbox: true, planner: true, board: true },
      "board",
    );
    expect(out).toEqual({ inbox: true, planner: true, board: false });
  });
});

describe("isSinglePanelOpen (helper)", () => {
  it("true when exactly one open", () => {
    expect(isSinglePanelOpen({ inbox: false, planner: false, board: true })).toBe(true);
    expect(isSinglePanelOpen({ inbox: true, planner: false, board: false })).toBe(true);
  });

  it("false when 0 or 2+ open", () => {
    expect(isSinglePanelOpen({ inbox: false, planner: false, board: false })).toBe(false);
    expect(isSinglePanelOpen({ inbox: true, planner: true, board: false })).toBe(false);
    expect(isSinglePanelOpen({ inbox: true, planner: true, board: true })).toBe(false);
  });
});

describe("INBOX_SEED", () => {
  it("has 3 items with bilingual text", () => {
    expect(INBOX_SEED).toHaveLength(3);
    for (const item of INBOX_SEED) {
      expect(typeof item.id).toBe("string");
      expect(typeof item.text.en).toBe("string");
      expect(typeof item.text.zh).toBe("string");
    }
  });
});
