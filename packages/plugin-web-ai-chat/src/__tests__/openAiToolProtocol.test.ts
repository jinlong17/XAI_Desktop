/**
 * openAiToolProtocol.test.ts — OAI-STREAM-1..4
 *
 * Tests for the OpenAI streaming delta.tool_calls parse in claudeStreamAdapter.
 * Verifies the index-keyed accumulator, first-delta-only id/name, multi-fragment
 * accumulation, JSON.parse-once behavior, and finish_reason handling.
 *
 * OAI-STREAM-1: golden multi-fragment accumulation — delta.tool_calls chunks accumulated
 *               per index, JSON.parse ONCE after stream; StreamChunk.toolUse surfaced
 * OAI-STREAM-2: first-delta-only id/name — subsequent deltas only have arguments;
 *               accumulator still builds correct {id,name,input}
 * OAI-STREAM-3: text-only turn (finish_reason:"stop") — no false toolUse surfaced
 * OAI-STREAM-4: defensive finish_reason — accumulated tool_calls by stream-end even
 *               if finish_reason was not exactly "tool_calls" (compat-server robustness)
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension
 * API contract: packages/xai-web-ai-chat/docs/api.md §15.4
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §10.2
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiKeyStorage } from "../internal/secretStore.js";
import { streamCompleteChat } from "../internal/claudeStreamAdapter.js";

// ---- Setup: provider = openai-compatible ------------------------------------

beforeEach(async () => {
  localStorage.clear();
  localStorage.setItem("xai_ai_provider", JSON.stringify("openai-compatible"));
  localStorage.setItem("xai_ai_base_url", JSON.stringify("https://api.groq.com/openai/v1"));
  await aiKeyStorage.saveKey("openai-compatible", "gsk-test-key");
  vi.restoreAllMocks();
});

// ---- SSE helpers ------------------------------------------------------------

function makeStream(...chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(enc.encode(chunk));
      }
      controller.close();
    },
  });
}

function sseData(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Collect all chunks from the async generator.
async function collectChunks(gen: AsyncIterable<{ accumulated: string; done: boolean; toolUse?: unknown }>) {
  const chunks: Array<{ accumulated: string; done: boolean; toolUse?: unknown }> = [];
  for await (const chunk of gen) {
    chunks.push({ ...chunk });
  }
  return chunks;
}

// ---- OAI-STREAM-1: golden multi-fragment accumulation -----------------------

describe("OAI-STREAM-1: golden delta.tool_calls multi-fragment accumulation → toolUse in final chunk", () => {
  it("accumulates fragmented function.arguments per index, parses once after finish_reason:tool_calls", async () => {
    // Discovery §2.3 golden SSE sequence:
    // Chunk 1: first delta (id + type + function.name + empty arguments)
    // Chunks 2+3: argument fragments
    // Chunk 4: finish_reason:"tool_calls"
    // Chunk 5: [DONE]
    const sseSequence = [
      // First delta: carries id, type, function.name, and initial empty arguments
      sseData({
        choices: [{
          index: 0,
          delta: {
            tool_calls: [{
              index: 0,
              id: "call_abc123",
              type: "function",
              function: { name: "create_task", arguments: "" },
            }],
          },
          finish_reason: null,
        }],
      }),
      // Fragment 2: arguments fragment "{\"title\":"
      sseData({
        choices: [{
          index: 0,
          delta: {
            tool_calls: [{
              index: 0,
              function: { arguments: '{"title":' },
            }],
          },
          finish_reason: null,
        }],
      }),
      // Fragment 3: arguments fragment "\"Buy milk\"}"
      sseData({
        choices: [{
          index: 0,
          delta: {
            tool_calls: [{
              index: 0,
              function: { arguments: '"Buy milk"}' },
            }],
          },
          finish_reason: null,
        }],
      }),
      // Final chunk: finish_reason:"tool_calls"
      sseData({
        choices: [{
          index: 0,
          delta: {},
          finish_reason: "tool_calls",
        }],
      }),
      // SSE sentinel
      "data: [DONE]\n\n",
    ].join("");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeStream(sseSequence), { status: 200 }),
    );

    const chunks = await collectChunks(
      streamCompleteChat({ text: "create a task", lang: "en", model: "haiku" }),
    );

    const finalChunk = chunks[chunks.length - 1]!;
    expect(finalChunk.done).toBe(true);
    expect(finalChunk.toolUse).toBeDefined();
    expect(finalChunk.toolUse).toMatchObject({
      id: "call_abc123",
      name: "create_task",
      input: { title: "Buy milk" },
    });
  });
});

// ---- OAI-STREAM-2: first-delta-only id/name ---------------------------------

describe("OAI-STREAM-2: first-delta-only id/name — subsequent deltas carry only arguments", () => {
  it("builds correct {id,name,input} even when id/name absent on subsequent deltas", async () => {
    const sseSequence = [
      // First delta: full (id + name)
      sseData({
        choices: [{
          index: 0,
          delta: {
            tool_calls: [{
              index: 0,
              id: "call_xyz789",
              type: "function",
              function: { name: "create_calendar_event", arguments: "" },
            }],
          },
          finish_reason: null,
        }],
      }),
      // Subsequent delta: NO id, NO name — only arguments fragment
      sseData({
        choices: [{
          index: 0,
          delta: {
            tool_calls: [{
              index: 0,
              // id and type deliberately absent — this is the real streaming shape
              function: { arguments: '{"title":"Team meeting","date":"2026-05-30"}' },
            }],
          },
          finish_reason: null,
        }],
      }),
      sseData({
        choices: [{
          index: 0,
          delta: {},
          finish_reason: "tool_calls",
        }],
      }),
      "data: [DONE]\n\n",
    ].join("");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeStream(sseSequence), { status: 200 }),
    );

    const chunks = await collectChunks(
      streamCompleteChat({ text: "schedule meeting", lang: "en", model: "haiku" }),
    );

    const final = chunks[chunks.length - 1]!;
    expect(final.done).toBe(true);
    expect(final.toolUse).toBeDefined();
    expect(final.toolUse).toMatchObject({
      id: "call_xyz789",
      name: "create_calendar_event",
      input: { title: "Team meeting", date: "2026-05-30" },
    });
  });
});

// ---- OAI-STREAM-3: text-only turn — no false toolUse -----------------------

describe("OAI-STREAM-3: text-only turn (finish_reason:stop) — no false toolUse surfaced", () => {
  it("yields accumulated text and no toolUse on a normal text response", async () => {
    const sseSequence = [
      sseData({
        choices: [{
          index: 0,
          delta: { content: "Here is your answer." },
          finish_reason: null,
        }],
      }),
      sseData({
        choices: [{
          index: 0,
          delta: {},
          finish_reason: "stop",
        }],
      }),
      "data: [DONE]\n\n",
    ].join("");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeStream(sseSequence), { status: 200 }),
    );

    const chunks = await collectChunks(
      streamCompleteChat({ text: "what is 2+2?", lang: "en", model: "haiku" }),
    );

    const final = chunks[chunks.length - 1]!;
    expect(final.done).toBe(true);
    expect(final.accumulated).toContain("Here is your answer.");
    // No tool use in text-only response
    expect(final.toolUse).toBeUndefined();
  });
});

// ---- OAI-STREAM-4: defensive finish_reason (compat-server mis-sets "stop") --

describe("OAI-STREAM-4: defensive finish_reason — tool_calls accumulated by stream-end even if finish_reason is 'stop'", () => {
  it("surfaces toolUse when tool_calls accumulated but finish_reason is 'stop' (compat-server robustness)", async () => {
    // Some openai-compatible servers (vLLM, older Groq) set finish_reason:"stop"
    // even when tool_calls were streamed (open-webui #21768 — discovery §2.3 note).
    // REAL-WORLD INSTANCE (2026-05-29 Gemini smoke): gemini-3.1-flash-lite streams
    // the tool_call in an early chunk with finish_reason:null, then a final chunk
    // with finish_reason:"stop" (NOT "tool_calls"). This defensive fallback is the
    // load-bearing path for that model. Evidence:
    // docs/reviews/xai-web-gemini-provider-enablement/20260529-smoke-evidence.md §2.5.
    // The adapter must still surface toolUse from the accumulated entries.
    const sseSequence = [
      // Tool call delta (finish_reason will be "stop", not "tool_calls")
      sseData({
        choices: [{
          index: 0,
          delta: {
            tool_calls: [{
              index: 0,
              id: "call_compat",
              type: "function",
              function: { name: "delete_task", arguments: '{"id":"t-compat-001"}' },
            }],
          },
          finish_reason: null,
        }],
      }),
      // finish_reason is "stop" (wrong, but defensive fallback should still work)
      sseData({
        choices: [{
          index: 0,
          delta: {},
          finish_reason: "stop",
        }],
      }),
      "data: [DONE]\n\n",
    ].join("");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeStream(sseSequence), { status: 200 }),
    );

    const chunks = await collectChunks(
      streamCompleteChat({ text: "delete task t-compat-001", lang: "en", model: "haiku" }),
    );

    const final = chunks[chunks.length - 1]!;
    expect(final.done).toBe(true);
    // The defensive fallback surfaces toolUse even when finish_reason was "stop"
    expect(final.toolUse).toBeDefined();
    expect(final.toolUse).toMatchObject({
      id: "call_compat",
      name: "delete_task",
      input: { id: "t-compat-001" },
    });
  });
});

// ---- OAI-STREAM-5: tool_call delta with NO `index` field (Gemini real shape) --

describe("OAI-STREAM-5: tool_call delta omitting `index` + extra_content (Gemini real-world shape)", () => {
  it("surfaces toolUse when the tool_call delta has no `index` field and finish_reason is 'stop'", async () => {
    // VERIFIED against the live Gemini endpoint (gemini-3.1-flash-lite, 2026-05-29
    // in-app smoke): the streamed tool_call delta carries NO `index` field (OpenAI
    // proper always does) and an extra `extra_content.google.thought_signature`,
    // then a separate chunk with finish_reason:"stop" (NOT "tool_calls"). The
    // original `if (typeof idx !== "number") continue;` dropped the whole tool_call
    // → no card rendered. The adapter now defaults a missing index to 0.
    const sseSequence = [
      sseData({
        choices: [{
          index: 0,
          delta: {
            role: "assistant",
            tool_calls: [{
              // NO `index` field here — the exact Gemini shape.
              extra_content: { google: { thought_signature: "EjQKMgEMOdb..." } },
              id: "GeecqNgN",
              type: "function",
              function: { name: "create_task", arguments: '{"title":"买牛奶","bucket":"next7"}' },
            }],
          },
          // NO finish_reason on the tool_call chunk.
        }],
      }),
      sseData({
        choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: "stop" }],
      }),
      "data: [DONE]\n\n",
    ].join("");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeStream(sseSequence), { status: 200 }),
    );

    const chunks = await collectChunks(
      streamCompleteChat({ text: "创建一个任务：明天买牛奶", lang: "en", model: "haiku" }),
    );

    const final = chunks[chunks.length - 1]!;
    expect(final.done).toBe(true);
    expect(final.toolUse).toBeDefined();
    expect(final.toolUse).toMatchObject({
      id: "GeecqNgN",
      name: "create_task",
      input: { title: "买牛奶", bucket: "next7" },
    });
  });
});
