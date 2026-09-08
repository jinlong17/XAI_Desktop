/**
 * board adapter — B1..B6
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { boardAdapter } from "../../adapters/board.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

const makeState = (boards: unknown[]) => ({
  boards,
  active: null,
  panels: null,
  inbox: null,
});

it("B1 — empty query → module-jump", () => {
  const hits = boardAdapter("", makeState([]));
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("B2 — match on board name en/zh → module-jump", () => {
  const state = makeState([
    {
      id: "board-1",
      name: { en: "Product Roadmap", zh: "产品路线图" },
      lists: [],
    },
  ]);
  const hitsEn = boardAdapter("roadmap", state);
  const hitsZh = boardAdapter("路线", state);
  expect(hitsEn).toHaveLength(1);
  expect(hitsEn[0]?.kind).toBe("module-jump");
  expect(hitsZh).toHaveLength(1);
});

it("B3 — match on card title en/zh → entity hit (entityId = card id)", () => {
  const state = makeState([
    {
      id: "board-1",
      name: { en: "Sprint Board", zh: "冲刺" },
      lists: [
        {
          id: "list-1",
          cards: [
            { id: "card-1", title: { en: "Fix login bug", zh: "修复登录bug" } },
            { id: "card-2", title: { en: "Add dark mode", zh: "添加深色模式" } },
          ],
        },
      ],
    },
  ]);
  const hits = boardAdapter("login", state);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("entity");
  expect(hits[0]?.entityId).toBe("card-1");
});

it("B4 — match on label → entity hit", () => {
  const state = makeState([
    {
      id: "board-1",
      name: { en: "Work", zh: "工作" },
      lists: [
        {
          id: "list-1",
          cards: [
            { id: "card-1", title: { en: "Refactor code" }, labels: ["urgent", "backend"] },
            { id: "card-2", title: { en: "Write docs" }, labels: ["docs"] },
          ],
        },
      ],
    },
  ]);
  const hits = boardAdapter("urgent", state);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("card-1");
});

it("B5 — null state → []", () => {
  expect(boardAdapter("test", null)).toHaveLength(0);
});

it("B6 — defensive on malformed Board shape", () => {
  const state = makeState([
    { id: "board-1", name: null, lists: "not-an-array" },
    42,
    null,
  ]);
  // Should not throw, just skip malformed entries
  expect(() => boardAdapter("test", state)).not.toThrow();
});
