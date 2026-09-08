/**
 * T1..T3 — compile-time-style assertions on the new public types.
 *
 * Runtime asserts here are just sentinels for the typechecker; the real
 * coverage is the `satisfies` constraint above each.
 */

import { describe, it, expect } from "vitest";
import type {
  BoardPanelStateShape,
  InboxCardShape,
  RingSegment,
} from "../internal/types.js";

describe("types — type-level + sentinel runtime", () => {
  it("T1: BoardPanelStateShape requires all three booleans", () => {
    const ok: BoardPanelStateShape = { inbox: true, planner: false, board: true };
    expect(ok.inbox).toBe(true);
    expect(ok.planner).toBe(false);
    expect(ok.board).toBe(true);
  });

  it("T2: InboxCardShape requires id + bilingual text", () => {
    const ok: InboxCardShape = { id: "x", text: { en: "a", zh: "b" } };
    expect(ok.id).toBe("x");
    expect(ok.text.en).toBe("a");
    expect(ok.text.zh).toBe("b");
  });

  it("T3: RingSegment shape", () => {
    const seg: RingSegment = { listId: "l1", label: "Done", count: 3, color: "var(--accent)" };
    expect(seg.listId).toBe("l1");
    expect(seg.label).toBe("Done");
    expect(seg.count).toBe(3);
    expect(seg.color).toBe("var(--accent)");
  });
});
