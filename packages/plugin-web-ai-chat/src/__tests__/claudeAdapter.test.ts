/**
 * claudeAdapter — Option A no-op shim tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — A
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  completeChat,
  DEMO_REPLY_EN,
  DEMO_REPLY_ZH,
  ADAPTER_DELAY_MIN_MS,
  ADAPTER_DELAY_MAX_MS,
} from "../internal/claudeAdapter.js";

describe("claudeAdapter (A)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("A1: resolves with the EN demo line when lang=en", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const promise = completeChat("hi", "en");
    await vi.advanceTimersByTimeAsync(ADAPTER_DELAY_MIN_MS);
    await expect(promise).resolves.toBe(DEMO_REPLY_EN);
  });

  it("A2: resolves with the ZH demo line when lang=zh", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const promise = completeChat("你好", "zh");
    await vi.advanceTimersByTimeAsync(ADAPTER_DELAY_MIN_MS);
    await expect(promise).resolves.toBe(DEMO_REPLY_ZH);
  });

  it("A3: with Math.random=0, delay equals ADAPTER_DELAY_MIN_MS exactly", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const promise = completeChat("x", "en");
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });
    // 1 ms shy of the minimum — not yet resolved.
    await vi.advanceTimersByTimeAsync(ADAPTER_DELAY_MIN_MS - 1);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await promise;
    expect(resolved).toBe(true);
  });

  it("A4: with Math.random ~1, delay is < ADAPTER_DELAY_MAX_MS but ≥ MIN", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    const promise = completeChat("x", "en");
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });
    // floor(0.999999 * span) → span - 1; so delay = MIN + span - 1 = MAX - 1
    await vi.advanceTimersByTimeAsync(ADAPTER_DELAY_MAX_MS - 2);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await promise;
    expect(resolved).toBe(true);
  });

  it("A5: empty text input does not throw and resolves with demo line", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const promise = completeChat("", "en");
    await vi.advanceTimersByTimeAsync(ADAPTER_DELAY_MIN_MS);
    await expect(promise).resolves.toBe(DEMO_REPLY_EN);
  });

  it("A6: adapter does not read or write window.claude", async () => {
    // Snapshot any "claude" descriptor before and after.
    const w = globalThis as unknown as Record<string, unknown>;
    const before = "claude" in w ? w["claude"] : undefined;

    vi.spyOn(Math, "random").mockReturnValue(0);
    const promise = completeChat("ping", "en");
    await vi.advanceTimersByTimeAsync(ADAPTER_DELAY_MIN_MS);
    await promise;

    const after = "claude" in w ? w["claude"] : undefined;
    expect(after).toBe(before);
  });
});
