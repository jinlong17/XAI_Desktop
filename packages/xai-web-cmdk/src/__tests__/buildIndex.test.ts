/**
 * buildIndex — BI1..BI8
 * api.md §6 + test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { buildIndex } from "../internal/buildIndex.js";
import {
  registerSearchAdapter,
  __resetCmdkRegistry,
} from "../internal/registry.js";
import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";

// Test helper: empty state record
const EMPTY_STATES = {} as unknown as Readonly<Record<WebModuleId, unknown>>;

beforeEach(() => {
  __resetCmdkRegistry();
});

function makeHit(overrides: Partial<SearchHit> & { id: string }): SearchHit {
  return {
    moduleId: "tasks",
    kind: "module-jump",
    label: { en: "Test", zh: "测试" },
    score: 80,
    ...overrides,
  };
}

it("BI1 — empty registry returns []", () => {
  const result = buildIndex("test", EMPTY_STATES);
  expect(result).toHaveLength(0);
});

it("BI2 — single adapter returning multiple hits", () => {
  const adapter: ModuleSearchAdapter = () => [
    makeHit({ id: "a:1", moduleId: "tasks", score: 90 }),
    makeHit({ id: "a:2", moduleId: "tasks", score: 70 }),
  ];
  registerSearchAdapter("tasks", adapter);
  const result = buildIndex("x", EMPTY_STATES);
  expect(result).toHaveLength(2);
});

it("BI3 — multiple adapters' hits concatenated and sorted by score desc", () => {
  const taskAdapter: ModuleSearchAdapter = () => [
    makeHit({ id: "t:1", moduleId: "tasks", score: 60 }),
  ];
  const habitAdapter: ModuleSearchAdapter = () => [
    makeHit({ id: "h:1", moduleId: "habits", score: 90 }),
  ];
  registerSearchAdapter("tasks", taskAdapter);
  registerSearchAdapter("habits", habitAdapter);

  const result = buildIndex("x", EMPTY_STATES);
  expect(result).toHaveLength(2);
  expect(result[0]?.score).toBe(90);
  expect(result[1]?.score).toBe(60);
});

it("BI4 — deterministic tie-break by moduleId asc", () => {
  const zAdapter: ModuleSearchAdapter = () => [
    makeHit({ id: "z:1", moduleId: "tasks", score: 50 }),
  ];
  const aAdapter: ModuleSearchAdapter = () => [
    makeHit({ id: "a:1", moduleId: "board", score: 50 }),
  ];
  registerSearchAdapter("tasks", zAdapter);
  registerSearchAdapter("board", aAdapter);

  const result = buildIndex("x", EMPTY_STATES);
  expect(result).toHaveLength(2);
  // Same score → alphabetical by moduleId: "board" < "tasks"
  expect(result[0]?.moduleId).toBe("board");
  expect(result[1]?.moduleId).toBe("tasks");
});

it("BI5 — cap at 50 hits total", () => {
  const bigAdapter: ModuleSearchAdapter = () =>
    Array.from({ length: 60 }, (_, i) =>
      makeHit({ id: `t:${i}`, moduleId: "tasks", score: 50 }),
    );
  registerSearchAdapter("tasks", bigAdapter);

  const result = buildIndex("x", EMPTY_STATES);
  expect(result.length).toBe(50);
});

it("BI6 — adapter that throws is caught and silently omitted; other adapters still run", () => {
  const throwingAdapter: ModuleSearchAdapter = () => {
    throw new Error("adapter error");
  };
  const goodAdapter: ModuleSearchAdapter = () => [
    makeHit({ id: "g:1", moduleId: "habits", score: 80 }),
  ];
  registerSearchAdapter("tasks", throwingAdapter);
  registerSearchAdapter("habits", goodAdapter);

  const result = buildIndex("x", EMPTY_STATES);
  expect(result).toHaveLength(1);
  expect(result[0]?.moduleId).toBe("habits");
});

it("BI7 — query '' returns hits from all registered adapters", () => {
  const a1: ModuleSearchAdapter = () => [makeHit({ id: "a:*", moduleId: "tasks", score: 50 })];
  const a2: ModuleSearchAdapter = () => [makeHit({ id: "b:*", moduleId: "board", score: 50 })];
  registerSearchAdapter("tasks", a1);
  registerSearchAdapter("board", a2);

  const result = buildIndex("", EMPTY_STATES);
  expect(result).toHaveLength(2);
});

it("BI8 — query is lowercased before adapter receives it", () => {
  let receivedQuery = "";
  const adapter: ModuleSearchAdapter = (q) => {
    receivedQuery = q;
    return [];
  };
  registerSearchAdapter("tasks", adapter);

  buildIndex("HELLO", EMPTY_STATES);
  expect(receivedQuery).toBe("hello");
});
