/**
 * habits adapter — H1..H5
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { habitsAdapter } from "../../adapters/habits.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

const makeState = (habits: unknown[]) => ({ habits });

it("H1 — empty query → module-jump", () => {
  const hits = habitsAdapter("", makeState([]));
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("H2 — habit name match en → entity", () => {
  const state = makeState([
    { id: "h1", name: { en: "Morning run", zh: "早跑" } },
    { id: "h2", name: { en: "Read books", zh: "读书" } },
  ]);
  const hits = habitsAdapter("morning", state);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("h1");
});

it("H3 — habit name match zh → entity", () => {
  const state = makeState([
    { id: "h3", name: { en: "Drink water", zh: "喝水" } },
  ]);
  const hits = habitsAdapter("喝", state);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("h3");
});

it("H4 — defensive on opaque shape", () => {
  const state = { habits: [{ id: "h4" }, "garbage", null, 42] };
  expect(() => habitsAdapter("test", state)).not.toThrow();
});

it("H5 — null state → []", () => {
  expect(habitsAdapter("morning", null)).toHaveLength(0);
});
