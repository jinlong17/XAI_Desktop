/**
 * matrix adapter — MX1..MX5
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { matrixAdapter } from "../../adapters/matrix.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

const makeState = (items?: {
  q1?: unknown[];
  q2?: unknown[];
  q3?: unknown[];
  q4?: unknown[];
}) => items ?? {};

it("MX1 — empty query → module-jump", () => {
  const hits = matrixAdapter("", makeState());
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("MX2 — match on q1/q2/q3/q4 item title → entity", () => {
  const state = makeState({
    q1: [{ id: "item-1", title: { en: "Launch product", zh: "发布产品" } }],
    q2: [{ id: "item-2", title: { en: "Read report", zh: "读报告" } }],
    q3: [{ id: "item-3", title: { en: "Reply emails", zh: "回复邮件" } }],
    q4: [{ id: "item-4", title: { en: "Scroll feeds", zh: "刷动态" } }],
  });
  const q1Hit = matrixAdapter("launch", state);
  expect(q1Hit[0]?.kind).toBe("entity");
  expect(q1Hit[0]?.entityId).toBe("item-1");

  const q2Hit = matrixAdapter("read rep", state);
  expect(q2Hit[0]?.entityId).toBe("item-2");
});

it("MX3 — bilingual title match", () => {
  const state = makeState({
    q1: [{ id: "item-5", title: { en: "Critical deadline", zh: "紧急截止" } }],
  });
  const hitsZh = matrixAdapter("紧急", state);
  expect(hitsZh).toHaveLength(1);
  expect(hitsZh[0]?.entityId).toBe("item-5");
});

it("MX4 — defensive on opaque state", () => {
  expect(() => matrixAdapter("test", "garbage")).not.toThrow();
  expect(matrixAdapter("test", null)).toHaveLength(0);
});

it("MX5 — empty quadrants → module-jump only for alias", () => {
  const hits = matrixAdapter("matrix", makeState({ q1: [], q2: [], q3: [], q4: [] }));
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});
