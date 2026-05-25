/**
 * tasks adapter — T1..T6
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { tasksAdapter } from "../../adapters/tasks.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

const makeState = (cards: unknown[]) => ({
  inbox: cards,
  today: [],
});

it("T1 — empty query returns single module-jump hit", () => {
  const hits = tasksAdapter("", makeState([]));
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("T2 — query matches title.en returns entity hit with entityId = card id", () => {
  const state = makeState([
    { id: "card-1", title: { en: "Buy groceries", zh: "买食物" } },
    { id: "card-2", title: { en: "Read book", zh: "读书" } },
  ]);
  const hits = tasksAdapter("grocer", state);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("entity");
  expect(hits[0]?.entityId).toBe("card-1");
});

it("T3 — query matches title.zh returns entity hit", () => {
  const state = makeState([
    { id: "card-3", title: { en: "Walk the dog", zh: "遛狗" } },
  ]);
  const hits = tasksAdapter("遛", state);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("card-3");
});

it("T4 — query matches sub.en or sub.zh returns entity hit", () => {
  const state = makeState([
    {
      id: "card-4",
      title: { en: "Project task", zh: "项目任务" },
      sub: { en: "Due by Friday", zh: "周五前完成" },
    },
  ]);
  const hitsEn = tasksAdapter("friday", state);
  const hitsZh = tasksAdapter("周五", state);
  expect(hitsEn[0]?.entityId).toBe("card-4");
  expect(hitsZh[0]?.entityId).toBe("card-4");
});

it("T5 — query matches tag returns entity hit", () => {
  const state = makeState([
    { id: "card-5", title: { en: "Design review" }, tag: "design" },
    { id: "card-6", title: { en: "Code review" }, tag: "code" },
  ]);
  const hits = tasksAdapter("design", state);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("card-5");
});

it("T6 — malformed state returns []", () => {
  expect(tasksAdapter("test", null)).toHaveLength(0);
  expect(tasksAdapter("test", "not-an-object")).toHaveLength(0);
  expect(tasksAdapter("test", 42)).toHaveLength(0);
});
