/**
 * settings adapter — SE1..SE6
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { settingsAdapter } from "../../adapters/settings.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

const mockPanes = [
  { id: "account" },
  { id: "appearance" },
  { id: "ai" },
  { id: "features" },
  { id: "hotkeys" },
];

it("SE1 — empty query → module-jump (Settings root)", () => {
  const hits = settingsAdapter("", mockPanes);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("SE2 — match on pane label en → settings-pane hit (entityId = paneId)", () => {
  const hits = settingsAdapter("account", mockPanes);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("settings-pane");
  expect(hits[0]?.entityId).toBe("account");
});

it("SE3 — match on pane label zh → settings-pane", () => {
  const hits = settingsAdapter("外观", mockPanes);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("appearance");
});

it("SE4 — multiple pane matches all returned", () => {
  // "app" is substring of "appearance", "account" (via "Account" in PANE_LABELS)
  // Actually: "a" is in account, appearance, ai — let's use 'hotkey' for specificity
  const hits = settingsAdapter("a", mockPanes);
  // Should return multiple matches (account, appearance, ai)
  expect(hits.length).toBeGreaterThanOrEqual(2);
});

it("SE5 — 'AI' matches 'ai' pane", () => {
  const hits = settingsAdapter("ai", mockPanes);
  expect(hits.some((h) => h.entityId === "ai")).toBe(true);
});

it("SE6 — defensive on missing paneRegistry import (null state)", () => {
  // When state is null/undefined, adapter uses PANE_LABELS fallback
  const hits = settingsAdapter("account", null);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("settings-pane");
});
