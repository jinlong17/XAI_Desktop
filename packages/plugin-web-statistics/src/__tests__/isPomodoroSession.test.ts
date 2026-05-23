import { describe, it, expect } from "vitest";
import { isPomodoroSession } from "../internal/isPomodoroSession.js";

describe("isPomodoroSession", () => {
  it("V1: accepts a valid focus session", () => {
    expect(
      isPomodoroSession({
        mode: "focus",
        durationMs: 1_500_000,
        finishedAt: "2026-05-23T10:00:00Z",
      }),
    ).toBe(true);
  });

  it("V2: rejects missing mode", () => {
    expect(
      isPomodoroSession({
        durationMs: 1_500_000,
        finishedAt: "2026-05-23T10:00:00Z",
      }),
    ).toBe(false);
  });

  it("V3: rejects unknown mode literal", () => {
    expect(
      isPomodoroSession({
        mode: "unknown",
        durationMs: 1_500_000,
        finishedAt: "2026-05-23T10:00:00Z",
      }),
    ).toBe(false);
  });

  it("V4: rejects durationMs as string", () => {
    expect(
      isPomodoroSession({
        mode: "focus",
        durationMs: "1500000",
        finishedAt: "2026-05-23T10:00:00Z",
      }),
    ).toBe(false);
  });

  it("V5: rejects missing finishedAt", () => {
    expect(
      isPomodoroSession({
        mode: "focus",
        durationMs: 1_500_000,
      }),
    ).toBe(false);
  });

  it("V6: rejects null/undefined/primitive inputs", () => {
    expect(isPomodoroSession(null)).toBe(false);
    expect(isPomodoroSession(undefined)).toBe(false);
    expect(isPomodoroSession(42)).toBe(false);
    expect(isPomodoroSession("focus")).toBe(false);
  });

  it("accepts short-break and long-break modes", () => {
    expect(
      isPomodoroSession({
        mode: "short-break",
        durationMs: 300_000,
        finishedAt: "2026-05-23T10:00:00Z",
      }),
    ).toBe(true);
    expect(
      isPomodoroSession({
        mode: "long-break",
        durationMs: 900_000,
        finishedAt: "2026-05-23T10:00:00Z",
      }),
    ).toBe(true);
  });

  it("rejects non-finite durationMs", () => {
    expect(
      isPomodoroSession({
        mode: "focus",
        durationMs: Number.NaN,
        finishedAt: "2026-05-23T10:00:00Z",
      }),
    ).toBe(false);
    expect(
      isPomodoroSession({
        mode: "focus",
        durationMs: Number.POSITIVE_INFINITY,
        finishedAt: "2026-05-23T10:00:00Z",
      }),
    ).toBe(false);
  });
});
