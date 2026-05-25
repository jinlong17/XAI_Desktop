/**
 * claudeAdapter — completeChat tests (A1..A8).
 *
 * A1..A6: no-op demo path (no key configured).
 * A7: key configured → returns real adapter response.
 * A8: key configured + adapter throws BadKey → re-throws.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 (A) + §7.3 (A7/A8)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  completeChat,
  DEMO_REPLY_EN,
  DEMO_REPLY_ZH,
  ADAPTER_DELAY_MIN_MS,
  ADAPTER_DELAY_MAX_MS,
} from "../internal/claudeAdapter.js";
import { aiKeyStorage } from "../internal/secretStore.js";

describe("claudeAdapter (A)", () => {
  beforeEach(async () => {
    // Clear keys with real timers first (IDB is async).
    await aiKeyStorage.clearKey("anthropic");
    await aiKeyStorage.clearKey("openai-compatible");
    localStorage.clear();
    // Only fake setTimeout — do NOT fake queueMicrotask/Promise/setImmediate
    // so that idb-keyval's internal IDB event dispatch still works.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // NOTE: A1..A6 test the no-key (demo) path. completeChat now calls
  // aiKeyStorage.loadKey() as the FIRST operation (before the timer delay).
  // With fake timers active, we need to advance the timer by 0 first to let
  // the IDB promise (microtask-based) settle, then advance by the actual delay.

  it("A1: resolves with the EN demo line when lang=en", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const promise = completeChat("hi", "en");
    // Let the IDB promise (loadKey) settle via microtask flush.
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(ADAPTER_DELAY_MIN_MS);
    await expect(promise).resolves.toBe(DEMO_REPLY_EN);
  });

  it("A2: resolves with the ZH demo line when lang=zh", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const promise = completeChat("你好", "zh");
    await vi.advanceTimersByTimeAsync(0);
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
    // Flush IDB microtask first.
    await vi.advanceTimersByTimeAsync(0);
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
    // Flush IDB microtask first.
    await vi.advanceTimersByTimeAsync(0);
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
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(ADAPTER_DELAY_MIN_MS);
    await expect(promise).resolves.toBe(DEMO_REPLY_EN);
  });

  it("A6: adapter does not read or write window.claude", async () => {
    // Snapshot any "claude" descriptor before and after.
    const w = globalThis as unknown as Record<string, unknown>;
    const before = "claude" in w ? w["claude"] : undefined;

    vi.spyOn(Math, "random").mockReturnValue(0);
    const promise = completeChat("ping", "en");
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(ADAPTER_DELAY_MIN_MS);
    await promise;

    const after = "claude" in w ? w["claude"] : undefined;
    expect(after).toBe(before);
  });

  it("A7: with API key configured + mock stream → returns accumulated assistant text", async () => {
    vi.useRealTimers(); // Real timers needed for async fetch stubs.
    await aiKeyStorage.saveKey("anthropic", "sk-ant-a7");

    const enc = new TextEncoder();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(enc.encode('event: content_block_delta\ndata: {"delta":{"type":"text_delta","text":"Hi!"}}\n\n'));
            c.close();
          },
        }),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );

    const result = await completeChat("hello", "en");
    expect(result).toBe("Hi!");
  });

  it("A8: with API key + mock returns 401 → re-throws LlmError BadKey", async () => {
    vi.useRealTimers();
    await aiKeyStorage.saveKey("anthropic", "sk-ant-a8");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"error":"Invalid key"}', { status: 401 }),
    );

    await expect(completeChat("hello", "en")).rejects.toMatchObject({
      kind: "BadKey",
      status: 401,
    });
  });
});
