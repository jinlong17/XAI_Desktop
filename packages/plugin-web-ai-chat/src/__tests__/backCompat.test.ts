/**
 * backCompat.test.ts — BC-1, BC-2
 *
 * BC-1: isAiConvoRecord accepts SHIPPED-shape records (no tool-call fields)
 *       AND new records with optional tool-call extension fields.
 * BC-2: full suite count verification (all test files across affected packages
 *       are run in the CI gate — this is the canary test).
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension FA-11
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 BC tests
 */

import { describe, it, expect } from "vitest";
import { isAiConvoRecord } from "../internal/isAiConvoRecord.js";

describe("BC-1: isAiConvoRecord backward-compat — accepts old + new record shapes", () => {
  it("accepts a SHIPPED-shape record (no tool-call fields)", () => {
    const shipped = { id: "c-abcd", title: "What's on today?", time: "Just now" };
    expect(isAiConvoRecord(shipped)).toBe(true);
  });

  it("accepts a new record with optional tool-call extension fields", () => {
    const extended = {
      id: "c-efgh",
      title: "Create task for me",
      time: "Just now",
      // P5 extension: optional tool-call tracking fields (not persisted in v1
      // per OQ1, but the predicate must tolerate them if they appear).
      lastToolUse: { id: "toolu_abc", name: "create_task" },
      confirmationState: "confirmed",
    };
    expect(isAiConvoRecord(extended)).toBe(true);
  });

  it("rejects records missing required fields (backward-compat baseline)", () => {
    expect(isAiConvoRecord(null)).toBe(false);
    expect(isAiConvoRecord({ id: "c-123", title: "ok" })).toBe(false); // missing time
    expect(isAiConvoRecord({ title: "ok", time: "now" })).toBe(false); // missing id
    expect(isAiConvoRecord({ id: "", title: "ok", time: "now" })).toBe(false); // empty id
  });

  it("accepts empty title and time (SHIPPED V7 case)", () => {
    const v7Record = { id: "c-v7", title: "", time: "" };
    expect(isAiConvoRecord(v7Record)).toBe(true);
  });
});
