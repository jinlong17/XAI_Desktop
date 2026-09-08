/**
 * countdown adapter — CD1..CD5
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { countdownAdapter } from "../../adapters/countdown.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

const countdowns = [
  { id: "cd-1", title: { en: "Birthday party", zh: "生日派对" }, targetDate: "2026-06-15" },
  { id: "cd-2", title: { en: "Product launch", zh: "产品发布" }, targetDate: "2026-07-01" },
];

it("CD1 — empty query → module-jump", () => {
  const hits = countdownAdapter("", countdowns);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("CD2 — title en match → entity", () => {
  const hits = countdownAdapter("birthday", countdowns);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("cd-1");
});

it("CD3 — title zh match → entity", () => {
  const hits = countdownAdapter("发布", countdowns);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("cd-2");
});

it("CD4 — null state → []", () => {
  expect(countdownAdapter("birthday", null)).toHaveLength(0);
});

it("CD5 — malformed Countdown shape → defensive", () => {
  const mixed = [
    { id: "cd-1", title: { en: "Valid item" } },
    { notAnId: true },
    null,
    42,
  ];
  expect(() => countdownAdapter("valid", mixed)).not.toThrow();
  const hits = countdownAdapter("valid", mixed);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("cd-1");
});
