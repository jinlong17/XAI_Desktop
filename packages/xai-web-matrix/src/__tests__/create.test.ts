/**
 * T-MADD-1..8 — addCard pure reducer unit tests.
 *
 * EP1 data layer.
 * Design: design.md §E.1 #3 (appends — Matrix move-convention, NOT prepend)
 */

import { describe, it, expect } from "vitest";
import { addCard } from "../internal/create.js";
import type { MatrixState } from "../types.js";

const EMPTY_STATE: MatrixState = {
  schemaVersion: 1,
  q1: [],
  q2: [],
  q3: [],
  q4: [],
};

const CARD_A = {
  id: "seed-1",
  title: { en: "Existing A", zh: "已有A" },
};

const CARD_B = {
  id: "seed-2",
  title: { en: "Existing B", zh: "已有B" },
};

describe("addCard pure reducer", () => {
  it("T-MADD-1: adds a card to an empty target quadrant; length === 1", () => {
    const next = addCard(EMPTY_STATE, { title: "New card" }, "q1");
    expect(next.q1.length).toBe(1);
    expect(next.q1[0]?.title.en).toBe("New card");
  });

  it("T-MADD-2: APPENDS to a non-empty target quadrant; new card is LAST (Matrix append convention)", () => {
    const stateWithOne: MatrixState = {
      schemaVersion: 1,
      q1: [CARD_A],
      q2: [],
      q3: [],
      q4: [],
    };
    const next = addCard(stateWithOne, { title: "Second card" }, "q1");
    expect(next.q1.length).toBe(2);
    // New card must be at the LAST position (appended, not prepended)
    const lastCard = next.q1[next.q1.length - 1];
    expect(lastCard?.title.en).toBe("Second card");
    // Existing card stays first
    expect(next.q1[0]?.id).toBe("seed-1");
  });

  it("T-MADD-3: adds to a previously empty quadrant when other quadrants are seeded", () => {
    const stateWithSeed: MatrixState = {
      schemaVersion: 1,
      q1: [CARD_A, CARD_B],
      q2: [],
      q3: [],
      q4: [],
    };
    // Add to q3 which is empty
    const next = addCard(stateWithSeed, { title: "Into q3" }, "q3");
    expect(next.q3.length).toBe(1);
    expect(next.q3[0]?.title.en).toBe("Into q3");
    // q1 stays unchanged
    expect(next.q1.length).toBe(2);
  });

  it("T-MADD-4: empty/whitespace title → returns the SAME state reference (no-op)", () => {
    const next1 = addCard(EMPTY_STATE, { title: "" }, "q1");
    expect(next1).toBe(EMPTY_STATE);

    const next2 = addCard(EMPTY_STATE, { title: "   " }, "q1");
    expect(next2).toBe(EMPTY_STATE);
  });

  it("T-MADD-5: unknown targetQuadrant → returns the SAME state reference", () => {
    const next = addCard(EMPTY_STATE, { title: "test" }, "q99" as never);
    expect(next).toBe(EMPTY_STATE);
  });

  it("T-MADD-6: untouched quadrants preserve referential equality", () => {
    const stateWithCards: MatrixState = {
      schemaVersion: 1,
      q1: [CARD_A],
      q2: [CARD_B],
      q3: [],
      q4: [],
    };
    const next = addCard(stateWithCards, { title: "New in q1" }, "q1");
    // Only q1 was modified; q2/q3/q4 must be the same references
    expect(next.q2).toBe(stateWithCards.q2);
    expect(next.q3).toBe(stateWithCards.q3);
    expect(next.q4).toBe(stateWithCards.q4);
  });

  it("T-MADD-7: new card has title.en === title.zh === trimmed; tag present only when draft.tag set; date/dateZh/taskId undefined", () => {
    // With tag
    const nextWithTag = addCard(EMPTY_STATE, { title: "  My task  ", tag: "work" }, "q2");
    const cardWithTag = nextWithTag.q2[0];
    if (!cardWithTag) throw new Error("Expected a card in q2");
    expect(cardWithTag.title.en).toBe("My task");
    expect(cardWithTag.title.zh).toBe("My task");
    expect(cardWithTag.tag).toBe("work");
    expect(cardWithTag.date).toBeUndefined();
    expect(cardWithTag.dateZh).toBeUndefined();
    expect(cardWithTag.taskId).toBeUndefined();

    // Without tag
    const nextNoTag = addCard(EMPTY_STATE, { title: "No tag card" }, "q3");
    const cardNoTag = nextNoTag.q3[0];
    if (!cardNoTag) throw new Error("Expected a card in q3");
    expect(cardNoTag.title.en).toBe("No tag card");
    expect(cardNoTag.title.zh).toBe("No tag card");
    expect(cardNoTag.tag).toBeUndefined();
  });

  it("T-MADD-8: schemaVersion preserved (1); card id passes createMatrixId-shaped check", () => {
    const next = addCard(EMPTY_STATE, { title: "Version test" }, "q4");
    expect(next.schemaVersion).toBe(1);

    const card = next.q4[0];
    if (!card) throw new Error("Expected a card in q4");
    expect(typeof card.id).toBe("string");
    expect(card.id.length).toBeGreaterThan(0);
    // Must NOT be a seed id
    expect(/^seed-\d+$/.test(card.id)).toBe(false);
  });
});
