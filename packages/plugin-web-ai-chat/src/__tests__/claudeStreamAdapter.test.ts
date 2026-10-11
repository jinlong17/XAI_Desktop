import { accountScope } from "@repo/plugin-web-storage";
import { resetAccountFixture } from "./accountTestSetup.js";
/**
 * claudeStreamAdapter tests — CS1..CS10.
 *
 * Tests streamCompleteChat behavior with various fetch stubs.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 (claudeStreamAdapter)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { streamCompleteChat } from "../internal/claudeStreamAdapter.js";
import { aiKeyStorage } from "../internal/secretStore.js";
import { onWebEvent } from "@repo/xai-web-event-bus";

// Helper: build an SSE Response body
function makeSseBody(events: string[]): ReadableStream {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(c) {
      for (const e of events) c.enqueue(enc.encode(e));
      c.close();
    },
  });
}

function anthropicDelta(text: string) {
  return `event: content_block_delta\ndata: ${JSON.stringify({ delta: { type: "text_delta", text } })}\n\n`;
}

beforeEach(async () => {
  resetAccountFixture();
  // Set provider back to anthropic
  localStorage.setItem(accountScope.physicalKey("xai_ai_provider"), JSON.stringify("anthropic"));
  // Set a fake key so tests that need a key get one.
  await aiKeyStorage.saveKey("anthropic", "sk-ant-test-adapter");
  vi.restoreAllMocks();
});

describe("claudeStreamAdapter streamCompleteChat (CS)", () => {
  it("CS1: happy path Anthropic stream — yields 3 chunks then done", async () => {
    const fetchStub = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        makeSseBody([
          anthropicDelta("He"),
          anthropicDelta("llo"),
          anthropicDelta(" world"),
        ]),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );

    const chunks = [];
    for await (const chunk of streamCompleteChat({ text: "hi", lang: "en", model: "haiku" })) {
      chunks.push(chunk);
    }

    expect(fetchStub).toHaveBeenCalledOnce();
    // Accumulated chunks grow progressively
    const accumulated = chunks.map((c) => c.accumulated);
    expect(accumulated[0]).toBe("He");
    expect(accumulated[1]).toBe("Hello");
    expect(accumulated[2]).toBe("Hello world");
    // Final chunk has done = true
    expect(chunks.at(-1)?.done).toBe(true);
  });

  it("CS2: happy path OpenAI-compatible — yields 2 chunks then done", async () => {
    localStorage.setItem(accountScope.physicalKey("xai_ai_provider"), JSON.stringify("openai-compatible"));
    localStorage.setItem(accountScope.physicalKey("xai_ai_base_url"), JSON.stringify("https://api.groq.com/openai/v1"));
    await aiKeyStorage.saveKey("openai-compatible", "oai-test-key");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        makeSseBody([
          `data: ${JSON.stringify({ choices: [{ delta: { content: "Hi" } }] })}\n\n`,
          `data: ${JSON.stringify({ choices: [{ delta: { content: " there" } }] })}\n\n`,
          `data: [DONE]\n\n`,
        ]),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );

    const chunks = [];
    for await (const chunk of streamCompleteChat({
      text: "hi",
      lang: "en",
      model: "haiku",
    })) {
      chunks.push(chunk);
    }
    expect(chunks.at(-1)?.done).toBe(true);
    expect(chunks.at(-1)?.accumulated).toBe("Hi there");
  });

  it("CS3: mid-stream abort via AbortController.abort() — iterator returns early; no throw", async () => {
    const controller = new AbortController();
    const enc = new TextEncoder();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        new ReadableStream({
          async start(c) {
            c.enqueue(enc.encode(anthropicDelta("chunk1")));
            // Abort after first chunk
            controller.abort();
            await new Promise((r) => setTimeout(r, 0));
            c.enqueue(enc.encode(anthropicDelta("chunk2")));
            c.close();
          },
        }),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );

    const chunks = [];
    let threw = false;
    try {
      for await (const chunk of streamCompleteChat({
        text: "hi",
        lang: "en",
        model: "haiku",
        signal: controller.signal,
      })) {
        chunks.push(chunk);
      }
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
  });

  it("CS4: BadKey 401 — throws LlmError({kind:'BadKey'})", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"error":"Invalid key"}', { status: 401 }),
    );

    await expect(
      (async () => {
        for await (const _c of streamCompleteChat({ text: "hi", lang: "en", model: "haiku" })) {
          // consume
        }
      })(),
    ).rejects.toMatchObject({ kind: "BadKey", status: 401 });
  });

  it("CS5: RateLimited 429 — throws LlmError + emits web:ai:rate-limited", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 429,
        headers: { "retry-after": "60" },
      }),
    );

    const events: unknown[] = [];
    const unsub = onWebEvent("web:ai:rate-limited", (e) => events.push(e));
    try {
      await expect(
        (async () => {
          for await (const _c of streamCompleteChat({ text: "hi", lang: "en", model: "haiku" })) {
            // consume
          }
        })(),
      ).rejects.toMatchObject({ kind: "RateLimited", retryAfterSec: 60 });

      expect(events).toHaveLength(1);
      expect((events[0] as { retryAfterSec: number }).retryAfterSec).toBe(60);
    } finally {
      unsub();
    }
  });

  it("CS6: Network reject — throws LlmError({kind:'Network'}) + emits web:ai:request-failed", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    const events: unknown[] = [];
    const unsub = onWebEvent("web:ai:request-failed", (e) => events.push(e));
    try {
      await expect(
        (async () => {
          for await (const _c of streamCompleteChat({ text: "hi", lang: "en", model: "haiku" })) {
            // consume
          }
        })(),
      ).rejects.toMatchObject({ kind: "Network" });

      expect(events).toHaveLength(1);
      expect((events[0] as { kind: string }).kind).toBe("network");
    } finally {
      unsub();
    }
  });

  it("CS7: Server 503 — throws LlmError({kind:'Server', status:503}) + emits web:ai:request-failed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Service Unavailable", { status: 503 }),
    );

    const events: unknown[] = [];
    const unsub = onWebEvent("web:ai:request-failed", (e) => events.push(e));
    try {
      await expect(
        (async () => {
          for await (const _c of streamCompleteChat({ text: "hi", lang: "en", model: "haiku" })) {
            // consume
          }
        })(),
      ).rejects.toMatchObject({ kind: "Server", status: 503 });
      expect(events).toHaveLength(1);
    } finally {
      unsub();
    }
  });

  it("CS8: Malformed SSE — skips bad chunks (no throw on chunk parse error)", async () => {
    // The parser skips chunks where JSON.parse fails. The stream still completes.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        makeSseBody([
          "event: content_block_delta\ndata: {bad json\n\n",
          anthropicDelta("valid"),
        ]),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );
    const chunks = [];
    for await (const chunk of streamCompleteChat({ text: "hi", lang: "en", model: "haiku" })) {
      chunks.push(chunk);
    }
    // The malformed chunk is skipped; the valid chunk accumulates.
    expect(chunks.at(-1)?.accumulated).toBe("valid");
  });

  it("CS9: streaming disabled — parses non-streaming provider JSON", async () => {
    localStorage.setItem(accountScope.physicalKey("xai_ai_streaming"), JSON.stringify(false));

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [{ type: "text", text: "non-streamed response" }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const chunks = [];
    for await (const chunk of streamCompleteChat({ text: "hi", lang: "en", model: "haiku" })) {
      chunks.push(chunk);
    }
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.done).toBe(true);
    expect(chunks[0]?.accumulated).toBe("non-streamed response");
  });

  it("CS10: no key configured — throws LlmError({kind:'BadKey', detail:'not-set'})", async () => {
    await aiKeyStorage.clearKey("anthropic");

    await expect(
      (async () => {
        for await (const _c of streamCompleteChat({ text: "hi", lang: "en", model: "haiku" })) {
          // consume
        }
      })(),
    ).rejects.toMatchObject({ kind: "BadKey", detail: "not-set" });
  });
});
