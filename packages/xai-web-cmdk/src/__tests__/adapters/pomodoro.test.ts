/**
 * pomodoro adapter — PM1..PM6 (includes AS2: "tomato" acceptance scenario)
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { pomodoroAdapter } from "../../adapters/pomodoro.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

const sessions = [
  { id: "session-1", mode: "focus", durationMs: 1500000, completedAt: "2026-05-10T10:00:00Z" },
  { id: "session-2", mode: "short-break", durationMs: 300000, completedAt: "2026-05-10T10:25:00Z" },
  { id: "session-3", mode: "long-break", durationMs: 900000, completedAt: "2026-05-10T11:00:00Z" },
];

it("PM1 — empty query → module-jump", () => {
  const hits = pomodoroAdapter("", sessions);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("PM2 — query 'tomato' matches → entity hits per session (AS2)", () => {
  // 'tomato' is an alias for pomodoro — matches all sessions
  const hits = pomodoroAdapter("tomato", sessions);
  expect(hits.length).toBeGreaterThan(0);
  expect(hits.every((h) => h.kind === "entity")).toBe(true);
  expect(hits[0]?.moduleId).toBe("pomodoro");
});

it("PM3 — query matches session.id substring → entity", () => {
  const hits = pomodoroAdapter("session-1", sessions);
  expect(hits).toHaveLength(1);
  expect(hits[0]?.entityId).toBe("session-1");
});

it("PM4 — query matches mode ('focus', 'short-break') → entity", () => {
  const focusHits = pomodoroAdapter("focus", sessions);
  expect(focusHits.length).toBeGreaterThan(0);
  expect(focusHits[0]?.kind).toBe("entity");

  const breakHits = pomodoroAdapter("short-break", sessions);
  expect(breakHits.length).toBeGreaterThan(0);
});

it("PM5 — null state → []", () => {
  expect(pomodoroAdapter("focus", null)).toHaveLength(0);
});

it("PM6 — malformed state → []", () => {
  expect(pomodoroAdapter("focus", { notAnArray: true })).toHaveLength(0);
  expect(pomodoroAdapter("focus", "string")).toHaveLength(0);
});
