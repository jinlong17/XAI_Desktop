/**
 * cardsReducer.test.ts — Tests R1..R8
 *
 * R1: addCard appends with a new id
 * R2: addCard generates unique ids on collision
 * R3: updateCard patches one card
 * R4: updateCard no-op on missing id
 * R5: deleteCard removes target
 * R6: deleteCard no-op on missing id
 * R7: immutability (input unchanged)
 * R8: order preserved
 */

import { describe, it, expect, vi } from "vitest";
import { addCard, updateCard, deleteCard, newCardId } from "../internal/cardsReducer.js";
import { FIXTURE_FUTURE, FIXTURE_LIGHT } from "../__fixtures__/cards.js";
import type { CountdownCard } from "../types.js";

const DRAFT: Omit<CountdownCard, "id"> = {
  title: { en: "Test", zh: "测试" },
  target_date: "2026-12-31",
  variant: "light",
  cover_url: null,
};

describe("addCard", () => {
  it("R1: appends card with a new id starting with 'cd_'", () => {
    const prev: CountdownCard[] = [];
    const result = addCard(prev, DRAFT);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toMatch(/^cd_/);
    expect(result[0]!.title.en).toBe("Test");
  });

  it("R2: re-rolls id on collision — produces a different id on re-roll", () => {
    // Compute what id would be generated with random value 0.1
    const collidingId = "cd_" + Math.floor(0.1 * 36 ** 8).toString(36).padStart(8, "0");
    const differentId = "cd_" + Math.floor(0.9 * 36 ** 8).toString(36).padStart(8, "0");

    let callCount = 0;
    const spy = vi.spyOn(Math, "random").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return 0.1;
      return 0.9;
    });

    const existing: CountdownCard[] = [{ ...DRAFT, id: collidingId }];
    const result = addCard(existing, DRAFT);
    // The new card's id should be differentId (from the re-roll)
    expect(result[1]!.id).toBe(differentId);
    expect(result[0]!.id).toBe(collidingId);
    spy.mockRestore();
  });
});

describe("updateCard", () => {
  it("R3: patches one card, leaving siblings unchanged", () => {
    const prev = [FIXTURE_FUTURE, FIXTURE_LIGHT];
    const result = updateCard(prev, FIXTURE_FUTURE.id, { title: { en: "Updated", zh: "更新" } });
    expect(result[0]!.title.en).toBe("Updated");
    expect(result[1]).toStrictEqual(FIXTURE_LIGHT);
  });

  it("R4: returns same array reference on missing id (no-op)", () => {
    const prev = [FIXTURE_FUTURE];
    const result = updateCard(prev, "nonexistent-id", { title: { en: "X", zh: "X" } });
    expect(result).toBe(prev);
  });
});

describe("deleteCard", () => {
  it("R5: removes the target card", () => {
    const prev = [FIXTURE_FUTURE, FIXTURE_LIGHT];
    const result = deleteCard(prev, FIXTURE_FUTURE.id);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(FIXTURE_LIGHT.id);
  });

  it("R6: returns same array reference on missing id (no-op)", () => {
    const prev = [FIXTURE_FUTURE];
    const result = deleteCard(prev, "nonexistent-id");
    expect(result).toBe(prev);
  });
});

describe("immutability", () => {
  it("R7: addCard does not mutate input", () => {
    const prev = [FIXTURE_FUTURE];
    const frozen = Object.freeze([...prev]);
    // Should not throw
    const result = addCard(frozen as CountdownCard[], DRAFT);
    expect(result).not.toBe(frozen);
    expect(frozen).toHaveLength(1);
  });

  it("R7b: updateCard does not mutate input", () => {
    const prev = [{ ...FIXTURE_FUTURE }];
    addCard(prev, DRAFT);
    const result = updateCard(prev, FIXTURE_FUTURE.id, { title: { en: "New", zh: "新" } });
    expect(prev[0]!.title.en).toBe("Weekend"); // unchanged
    expect(result[0]!.title.en).toBe("New");
  });

  it("R7c: deleteCard does not mutate input", () => {
    const prev = [{ ...FIXTURE_FUTURE }, { ...FIXTURE_LIGHT }];
    const copy = [...prev];
    deleteCard(prev, FIXTURE_FUTURE.id);
    expect(prev).toHaveLength(2); // unchanged
    void copy;
  });
});

describe("order", () => {
  it("R8: addCard appends to end (order preserved)", () => {
    const prev = [FIXTURE_FUTURE, FIXTURE_LIGHT];
    const result = addCard(prev, DRAFT);
    expect(result[0]!.id).toBe(FIXTURE_FUTURE.id);
    expect(result[1]!.id).toBe(FIXTURE_LIGHT.id);
    expect(result[2]!.id).toMatch(/^cd_/);
  });

  it("R8b: updateCard preserves array order", () => {
    const prev = [FIXTURE_FUTURE, FIXTURE_LIGHT];
    const result = updateCard(prev, FIXTURE_LIGHT.id, { title: { en: "X", zh: "X" } });
    expect(result[0]!.id).toBe(FIXTURE_FUTURE.id);
    expect(result[1]!.id).toBe(FIXTURE_LIGHT.id);
  });
});

describe("newCardId", () => {
  it("returns a string starting with cd_", () => {
    const id = newCardId();
    expect(id).toMatch(/^cd_[a-z0-9]{8}$/);
  });
});
