/**
 * dashboard adapter — D1..D5
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { dashboardAdapter } from "../../adapters/dashboard.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

it("D1 — empty query → module-jump", () => {
  const hits = dashboardAdapter("", {});
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("D2 — match on widget i18n label → module-jump (no entity)", () => {
  const state = {
    dashOrder: ["clock", "tasks", "habits"],
    clockStyle: "classic",
  };
  const hits = dashboardAdapter("clock", state);
  expect(hits.length).toBeGreaterThan(0);
  expect(hits.every((h) => h.kind === "module-jump")).toBe(true);
});

it("D3 — clock style match → module-jump", () => {
  const state = { dashOrder: [], clockStyle: "analog" };
  const hits = dashboardAdapter("analog", state);
  expect(hits.length).toBeGreaterThan(0);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("D4 — null state → still single module-jump on name alias", () => {
  const hits = dashboardAdapter("dashboard", null);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("D5 — malformed state returns module-jump only on alias match", () => {
  const hits = dashboardAdapter("dash", "not-an-object");
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});
