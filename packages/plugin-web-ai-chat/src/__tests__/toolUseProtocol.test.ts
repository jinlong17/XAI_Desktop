/**
 * toolUseProtocol.test.ts — TU-1..TU-7 + TU-REG
 *
 * P2: adapter tool-use protocol tests.
 * Tests buildBody widening (tools param, content blocks) + claudeStreamAdapter
 * tool_use block detection (streaming golden from discovery §2.5).
 *
 * TU-1: buildBody includes tools when provided (Anthropic branch)
 * TU-2: streaming golden — §2.5 input_json_delta accumulated per block index,
 *        JSON.parse once at content_block_stop → toolUse in final chunk
 * TU-3: stop_reason:"tool_use" sets toolUse in final StreamChunk
 * TU-4: text block before tool_use block — both text + toolUse surfaced
 * TU-5: content-block messages (tool_result round-trip body shape)
 * TU-6: string-content messages unchanged (backward compat — R1)
 * TU-7: OpenAI-compatible: tools NOT sent (planner's-call #3)
 * TU-REG: ALL SHIPPED adapter/sse/provider tests remain green (verified by running full suite)
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension FA-5/6
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 TU tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock setup BEFORE any imports that use these modules ----
vi.mock("@repo/plugin-web-storage", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@repo/plugin-web-storage")>()),
  getPref: vi.fn(),
  setPref: vi.fn(),
}));
vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
  useWebEventListener: vi.fn(),
}));
vi.mock("../internal/secretStore.js", () => ({
  aiKeyStorage: {
    loadKey: vi.fn().mockResolvedValue("sk-ant-test"),
    saveKey: vi.fn(),
    clearKey: vi.fn(),
    testConnection: vi.fn(),
  },
}));
vi.mock("../internal/contextProvider.js", () => ({
  buildTodayContext: vi.fn().mockReturnValue({ text: "", isEmpty: true }),
}));

import { getPref } from "@repo/plugin-web-storage";
import { streamCompleteChat } from "../internal/claudeStreamAdapter.js";
import { resolveProvider } from "../internal/llmProvider.js";
import type { AnthropicToolDef } from "../internal/toolUseTypes.js";

const mockGetPref = vi.mocked(getPref);

// Helper: build a ReadableStream from SSE string chunks
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

// Helper: SSE event line
function sseEvent(eventType: string, data: string): string {
  return `event: ${eventType}\ndata: ${data}\n\n`;
}

// Collect all chunks from the async generator
async function collectChunks(gen: AsyncIterable<{ accumulated: string; done: boolean; toolUse?: unknown }>) {
  const chunks: Array<{ accumulated: string; done: boolean; toolUse?: unknown }> = [];
  for await (const chunk of gen) {
    chunks.push({ ...chunk });
  }
  return chunks;
}

const ANTHROPIC_TOOL: AnthropicToolDef = {
  name: "create_task",
  description: "Create a new task.",
  input_schema: {
    type: "object",
    properties: { title: { type: "string" } },
    required: ["title"],
  },
};

import { aiKeyStorage } from "../internal/secretStore.js";
const mockLoadKey = vi.mocked(aiKeyStorage.loadKey);

beforeEach(() => {
  vi.clearAllMocks();
  mockLoadKey.mockResolvedValue("sk-ant-test");
  mockGetPref.mockImplementation((key: string) => {
    if (key === "xai_ai_provider") return "anthropic";
    if (key === "xai_ai_streaming") return true;
    if (key === "xai_ai_model_default") return "haiku";
    return null;
  });
});

// ---- TU-1: buildBody includes tools (Anthropic) ----
describe("TU-1: buildBody includes tools when provided on Anthropic branch", () => {
  it("emits tools array and preserves backward compat for no-tools call", () => {
    const config = resolveProvider("sk-ant-test");

    // With tools
    const bodyWithTools = config.buildBody({
      modelId: "claude-haiku-4-5-20251101",
      messages: [{ role: "user", content: "hello" }],
      stream: true,
      tools: [ANTHROPIC_TOOL],
    });
    expect(bodyWithTools["tools"]).toEqual([ANTHROPIC_TOOL]);

    // Without tools (R1 backward compat)
    const bodyNoTools = config.buildBody({
      modelId: "claude-haiku-4-5-20251101",
      messages: [{ role: "user", content: "hello" }],
      stream: true,
    });
    expect(bodyNoTools["tools"]).toBeUndefined();
  });
});

// ---- TU-2: §2.5 streaming golden — input_json_delta per-block accumulation ----
describe("TU-2: streaming golden — input_json_delta accumulated per block, JSON.parse once at content_block_stop", () => {
  it("yields toolUse in final chunk after accumulating partial_json fragments", async () => {
    // Literal SSE sequence from discovery §2.5 (pinned 2026-05-29)
    const sseSequence = [
      sseEvent("content_block_start", JSON.stringify({
        type: "content_block_start",
        index: 1,
        content_block: { type: "tool_use", id: "toolu_01T1x", name: "create_task", input: {} },
      })),
      sseEvent("content_block_delta", JSON.stringify({
        type: "content_block_delta",
        index: 1,
        delta: { type: "input_json_delta", partial_json: '{"title":' },
      })),
      sseEvent("content_block_delta", JSON.stringify({
        type: "content_block_delta",
        index: 1,
        delta: { type: "input_json_delta", partial_json: '"Buy milk"}' },
      })),
      sseEvent("content_block_stop", JSON.stringify({
        type: "content_block_stop",
        index: 1,
      })),
      sseEvent("message_delta", JSON.stringify({
        type: "message_delta",
        delta: { stop_reason: "tool_use", stop_sequence: null },
        usage: { output_tokens: 32 },
      })),
      sseEvent("message_stop", JSON.stringify({ type: "message_stop" })),
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
      id: "toolu_01T1x",
      name: "create_task",
      input: { title: "Buy milk" },
    });
  });
});

// ---- TU-3: stop_reason:"tool_use" sets toolUse ----
describe("TU-3: stop_reason tool_use in final StreamChunk", () => {
  it("sets toolUse only when stop_reason is tool_use", async () => {
    const sseSequence = [
      sseEvent("content_block_start", JSON.stringify({
        type: "content_block_start",
        index: 0,
        content_block: { type: "tool_use", id: "toolu_abc", name: "create_calendar_event", input: {} },
      })),
      sseEvent("content_block_delta", JSON.stringify({
        type: "content_block_delta",
        index: 0,
        delta: { type: "input_json_delta", partial_json: '{"title":"Meeting","date":"2026-05-30"}' },
      })),
      sseEvent("content_block_stop", JSON.stringify({ type: "content_block_stop", index: 0 })),
      sseEvent("message_delta", JSON.stringify({
        type: "message_delta",
        delta: { stop_reason: "tool_use" },
      })),
      sseEvent("message_stop", JSON.stringify({ type: "message_stop" })),
    ].join("");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeStream(sseSequence), { status: 200 }),
    );

    const chunks = await collectChunks(
      streamCompleteChat({ text: "schedule meeting", lang: "en", model: "haiku" }),
    );

    const final = chunks[chunks.length - 1]!;
    expect(final.done).toBe(true);
    expect(final.toolUse).toMatchObject({
      name: "create_calendar_event",
      input: { title: "Meeting", date: "2026-05-30" },
    });
  });
});

// ---- TU-4: text block before tool_use block — both surfaced ----
describe("TU-4: interleaved text block + tool_use block", () => {
  it("accumulates text from text_delta and toolUse from tool_use block", async () => {
    const sseSequence = [
      // Text block (index 0)
      sseEvent("content_block_start", JSON.stringify({
        type: "content_block_start",
        index: 0,
        content_block: { type: "text" },
      })),
      sseEvent("content_block_delta", JSON.stringify({
        type: "content_block_delta",
        index: 0,
        delta: { type: "text_delta", text: "I'll create that task." },
      })),
      sseEvent("content_block_stop", JSON.stringify({ type: "content_block_stop", index: 0 })),
      // Tool use block (index 1)
      sseEvent("content_block_start", JSON.stringify({
        type: "content_block_start",
        index: 1,
        content_block: { type: "tool_use", id: "toolu_xyz", name: "create_task", input: {} },
      })),
      sseEvent("content_block_delta", JSON.stringify({
        type: "content_block_delta",
        index: 1,
        delta: { type: "input_json_delta", partial_json: '{"title":"Test"}' },
      })),
      sseEvent("content_block_stop", JSON.stringify({ type: "content_block_stop", index: 1 })),
      sseEvent("message_delta", JSON.stringify({
        type: "message_delta",
        delta: { stop_reason: "tool_use" },
      })),
      sseEvent("message_stop", JSON.stringify({ type: "message_stop" })),
    ].join("");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeStream(sseSequence), { status: 200 }),
    );

    const chunks = await collectChunks(
      streamCompleteChat({ text: "add a task", lang: "en", model: "haiku", tools: [ANTHROPIC_TOOL] }),
    );

    const final = chunks[chunks.length - 1]!;
    expect(final.done).toBe(true);
    // Text was accumulated from text_delta
    expect(final.accumulated).toBe("I'll create that task.");
    // toolUse from tool_use block
    expect(final.toolUse).toMatchObject({ name: "create_task", input: { title: "Test" } });
  });
});

// ---- TU-5: content-block messages (tool_result round-trip body shape) ----
describe("TU-5: content-block messages — buildBody accepts ContentBlock[] content", () => {
  it("passes through assistant tool_use turn + user tool_result turn unchanged", () => {
    const config = resolveProvider("sk-ant-test");

    const messages = [
      { role: "user" as const, content: "create a task" },
      {
        role: "assistant" as const,
        content: [
          { type: "tool_use" as const, id: "toolu_01", name: "create_task", input: { title: "Buy milk" } },
        ],
      },
      {
        role: "user" as const,
        content: [
          { type: "tool_result" as const, tool_use_id: "toolu_01", content: "Created task 'Buy milk'.", is_error: false },
        ],
      },
    ];

    const body = config.buildBody({ modelId: "claude-haiku-4-5-20251101", messages, stream: true });
    const sentMessages = body["messages"] as typeof messages;
    expect(sentMessages).toHaveLength(3);
    expect((sentMessages[1]!.content as Array<{ type: string }>)[0]!.type).toBe("tool_use");
    expect((sentMessages[2]!.content as Array<{ type: string }>)[0]!.type).toBe("tool_result");
  });
});

// ---- TU-6: string-content messages unchanged (backward compat R1) ----
describe("TU-6: string content messages stay unchanged (backward compat)", () => {
  it("string content is passed through as-is", async () => {
    // A normal text stream — no tool_use
    const sseSequence = [
      sseEvent("content_block_start", JSON.stringify({
        type: "content_block_start",
        index: 0,
        content_block: { type: "text" },
      })),
      sseEvent("content_block_delta", JSON.stringify({
        type: "content_block_delta",
        index: 0,
        delta: { type: "text_delta", text: "Hello!" },
      })),
      sseEvent("content_block_stop", JSON.stringify({ type: "content_block_stop", index: 0 })),
      sseEvent("message_delta", JSON.stringify({
        type: "message_delta",
        delta: { stop_reason: "end_turn" },
      })),
      sseEvent("message_stop", JSON.stringify({ type: "message_stop" })),
    ].join("");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeStream(sseSequence), { status: 200 }),
    );

    const chunks = await collectChunks(
      streamCompleteChat({ text: "hello", lang: "en", model: "haiku" }),
    );

    const final = chunks[chunks.length - 1]!;
    expect(final.done).toBe(true);
    expect(final.accumulated).toBe("Hello!");
    // No tool_use in text-only response
    expect(final.toolUse).toBeUndefined();
  });
});

// ---- TU-7: OpenAI-compatible — tools NOW sent in OpenAI function format (deferral lifted) ----
//
// REWRITE: The deferral (planner's-call #3 from xai-web-ai-tool-layer) is now lifted by
// xai-web-ai-tool-openai-compatible P1. The openai buildBody now serializes tools in
// OpenAI function-calling format ({type:"function", function:{name,description,parameters}}).
// This test now asserts the lifted behavior — keeping it as `toBeUndefined()` would contradict
// the live code. See OAI-NODRIFT-1 in openAiAntiDrift.test.ts for source-text guard.
describe("TU-7: OpenAI-compatible provider — tools NOW serialized in OpenAI function format", () => {
  it("includes tools in OpenAI function format on openai-compatible buildBody", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_ai_provider") return "openai-compatible";
      if (key === "xai_ai_base_url") return "https://api.groq.com/openai/v1";
      return null;
    });

    const config = resolveProvider("sk-groq-test");
    expect(config.provider).toBe("openai-compatible");

    const body = config.buildBody({
      modelId: "llama3-8b",
      messages: [{ role: "user", content: "hello" }],
      stream: true,
      tools: [ANTHROPIC_TOOL],
    });
    // openai-compatible buildBody NOW serializes tools in OpenAI function format.
    // The deferral comment at llmProvider.ts:96 has been deleted.
    expect(body["tools"]).toBeDefined();
    const tools = body["tools"] as Array<{ type: string; function: { name: string } }>;
    expect(tools).toHaveLength(1);
    expect(tools[0]!.type).toBe("function");
    expect(tools[0]!.function.name).toBe("create_task");
  });

  it("no-tools call: tools still absent from body (backward compat preserved)", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_ai_provider") return "openai-compatible";
      if (key === "xai_ai_base_url") return "https://api.groq.com/openai/v1";
      return null;
    });

    const config = resolveProvider("sk-groq-test");

    const body = config.buildBody({
      modelId: "llama3-8b",
      messages: [{ role: "user", content: "hello" }],
      stream: true,
      // tools: not provided
    });
    expect(body["tools"]).toBeUndefined();
  });
});
