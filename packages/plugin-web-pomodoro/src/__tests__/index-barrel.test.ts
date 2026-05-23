/**
 * B1..B5 — Public surface barrel tests.
 *
 * Verifies that index.ts exports exactly the surface declared in api.md §0.
 * test.md §2 B1..B5.
 */

import { describe, it, expect, expectTypeOf } from "vitest";
import * as Pomodoro from "../index.js";
import type { PomodoroSession, PomodoroMode } from "../index.js";

describe("index barrel — public surface", () => {
  // B1: expected named exports present
  it("B1: exports PomodoroModule, pomodoroWebModuleRegistration, DEFAULT_DURATIONS_MS", () => {
    expect(typeof Pomodoro.PomodoroModule).toBe("function");
    expect(Pomodoro.pomodoroWebModuleRegistration).toBeDefined();
    expect(typeof Pomodoro.DEFAULT_DURATIONS_MS).toBe("object");
  });

  // B2: type exports (compilation check — if this file type-checks, they exist)
  it("B2: exports PomodoroSession and PomodoroMode types (compile-time)", () => {
    // Runtime check: the type-only imports compile without error
    const _session: PomodoroSession = {
      id: "pomo_test",
      mode: "focus",
      startedAt: "2026-05-23T14:00:00.000Z",
      finishedAt: "2026-05-23T14:25:00.000Z",
      durationMs: 25 * 60 * 1000,
      elapsedMs: 25 * 60 * 1000,
      completed: true,
    };
    const _mode: PomodoroMode = "focus";
    expect(_session.id).toBe("pomo_test");
    expect(_mode).toBe("focus");
  });

  // B3: no unexpected additional runtime exports
  it("B3: no extra unexpected runtime exports", () => {
    const knownExports = new Set([
      "PomodoroModule",
      "pomodoroWebModuleRegistration",
      "DEFAULT_DURATIONS_MS",
    ]);
    const actualExports = Object.keys(Pomodoro).filter(
      (k) => !k.startsWith("_") && k !== "__esModule",
    );
    for (const key of actualExports) {
      expect(knownExports.has(key), `Unexpected export: ${key}`).toBe(true);
    }
  });

  // B4: DEFAULT_DURATIONS_MS is frozen (no direct import deep test — just shape)
  it("B4: DEFAULT_DURATIONS_MS is frozen with correct keys", () => {
    expect(Object.isFrozen(Pomodoro.DEFAULT_DURATIONS_MS)).toBe(true);
    expect(Pomodoro.DEFAULT_DURATIONS_MS).toHaveProperty("focus");
    expect(Pomodoro.DEFAULT_DURATIONS_MS).toHaveProperty("short-break");
    expect(Pomodoro.DEFAULT_DURATIONS_MS).toHaveProperty("long-break");
  });

  // B5: PomodoroSession type matches api.md §1.2 — structural check via expectTypeOf
  it("B5: PomodoroSession has all required fields with correct types", () => {
    expectTypeOf<PomodoroSession>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<PomodoroSession>().toHaveProperty("mode").toEqualTypeOf<PomodoroMode>();
    expectTypeOf<PomodoroSession>().toHaveProperty("startedAt").toEqualTypeOf<string>();
    expectTypeOf<PomodoroSession>().toHaveProperty("finishedAt").toEqualTypeOf<string>();
    expectTypeOf<PomodoroSession>().toHaveProperty("durationMs").toEqualTypeOf<number>();
    expectTypeOf<PomodoroSession>().toHaveProperty("elapsedMs").toEqualTypeOf<number>();
    expectTypeOf<PomodoroSession>().toHaveProperty("completed").toEqualTypeOf<boolean>();
  });
});
