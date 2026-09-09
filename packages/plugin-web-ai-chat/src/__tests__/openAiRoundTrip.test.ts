import { accountScope } from "@repo/plugin-web-storage";
/**
 * openAiRoundTrip.test.ts — OAI-RT-1..3 + OAI-PARITY-1..2
 *
 * Tests for the OpenAI tool-role result round-trip body translation in
 * llmProvider.ts openai buildBody, and provider-parity assertions proving
 * both providers produce the same normalized StreamChunk.toolUse and the
 * same web:*-requested event payload via toWriteEvent.
 *
 * OAI-RT-1: assistant turn with tool_use block → OpenAI assistant + tool_calls
 * OAI-RT-2: user turn with tool_result block → OpenAI "tool"-role message
 * OAI-RT-3: string content messages passed through unchanged
 *
 * OAI-PARITY-1: Anthropic golden SSE vs openai golden SSE → identical
 *               normalized StreamChunk.toolUse {id, name, input}
 * OAI-PARITY-2: same toolUse.input → same toWriteEvent payload via findTool;
 *               proves the provider-agnostic confirmation→event path
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension
 * API contract: packages/xai-web-ai-chat/docs/api.md §15.3 (priorMessages translator),
 *               §15.5 (provider-agnostic path above the seam)
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §10.3
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock setup BEFORE imports that depend on these modules ----
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
    loadKey: vi.fn().mockResolvedValue("sk-test"),
    saveKey: vi.fn(),
    clearKey: vi.fn(),
    testConnection: vi.fn(),
  },
}));
vi.mock("../internal/contextProvider.js", () => ({
  buildTodayContext: vi.fn().mockReturnValue({ text: "", isEmpty: true }),
}));

import { getPref } from "@repo/plugin-web-storage";
import { resolveProvider } from "../internal/llmProvider.js";
import { streamCompleteChat } from "../internal/claudeStreamAdapter.js";
import { findTool } from "../internal/toolRegistry.js";
import type { ToolUseResult } from "../internal/toolUseTypes.js";
import { aiKeyStorage } from "../internal/secretStore.js";

const mockGetPref = vi.mocked(getPref);
const mockLoadKey = vi.mocked(aiKeyStorage.loadKey);

// ---- Fixtures ---------------------------------------------------------------

const TOOL_USE_BLOCK = {
  type: "tool_use" as const,
  id: "toolu_01",
  name: "create_task",
  input: { title: "Buy groceries", bucket: "next7" },
};

const TOOL_RESULT_BLOCK = {
  type: "tool_result" as const,
  tool_use_id: "toolu_01",
  content: "Tool 'create_task' executed successfully.",
  is_error: false,
};

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

async function collectChunks(gen: AsyncIterable<{ accumulated: string; done: boolean; toolUse?: ToolUseResult }>) {
  const chunks: Array<{ accumulated: string; done: boolean; toolUse?: ToolUseResult }> = [];
  for await (const chunk of gen) {
    chunks.push({ ...chunk });
  }
  return chunks;
}

// ---- OAI-RT-1: assistant tool_use block → OpenAI assistant + tool_calls ----

describe("OAI-RT-1: assistant turn with tool_use block → OpenAI assistant with tool_calls", () => {
  beforeEach(() => {
    localStorage.setItem(accountScope.physicalKey("xai_ai_provider"), JSON.stringify("openai-compatible"));
    localStorage.setItem(accountScope.physicalKey("xai_ai_base_url"), JSON.stringify("https://api.groq.com/openai/v1"));
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_ai_provider") return "openai-compatible";
      if (key === "xai_ai_base_url") return "https://api.groq.com/openai/v1";
      return null;
    });
  });

  it("translates assistant tool_use content block to OpenAI tool_calls format", () => {
    const config = resolveProvider("sk-test");

    const messages = [
      { role: "user" as const, content: "create a grocery task" },
      { role: "assistant" as const, content: [TOOL_USE_BLOCK] },
    ];

    const body = config.buildBody({
      modelId: "llama3-8b",
      messages,
      stream: true,
    });

    const sentMessages = body["messages"] as Array<Record<string, unknown>>;
    expect(sentMessages).toHaveLength(2);

    // First message: plain user string — unchanged
    expect(sentMessages[0]).toEqual({ role: "user", content: "create a grocery task" });

    // Second message: assistant with tool_calls (OpenAI format)
    const assistantMsg = sentMessages[1]!;
    expect(assistantMsg["role"]).toBe("assistant");
    expect(assistantMsg["content"]).toBeNull();
    const toolCalls = assistantMsg["tool_calls"] as Array<Record<string, unknown>>;
    expect(toolCalls).toHaveLength(1);
    expect(toolCalls[0]!["id"]).toBe("toolu_01");
    expect(toolCalls[0]!["type"]).toBe("function");
    const fn = toolCalls[0]!["function"] as Record<string, unknown>;
    expect(fn["name"]).toBe("create_task");
    // arguments is JSON.stringify(input)
    expect(JSON.parse(fn["arguments"] as string)).toEqual({ title: "Buy groceries", bucket: "next7" });
  });
});

// ---- OAI-RT-2: user tool_result block → OpenAI "tool"-role message ----------

describe("OAI-RT-2: user turn with tool_result block → OpenAI 'tool'-role message", () => {
  beforeEach(() => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_ai_provider") return "openai-compatible";
      if (key === "xai_ai_base_url") return "https://api.groq.com/openai/v1";
      return null;
    });
  });

  it("translates user tool_result content block to OpenAI tool-role message", () => {
    const config = resolveProvider("sk-test");

    const messages = [
      { role: "user" as const, content: [TOOL_RESULT_BLOCK] },
    ];

    const body = config.buildBody({
      modelId: "llama3-8b",
      messages,
      stream: true,
    });

    const sentMessages = body["messages"] as Array<Record<string, unknown>>;
    expect(sentMessages).toHaveLength(1);

    const toolMsg = sentMessages[0]!;
    expect(toolMsg["role"]).toBe("tool");
    expect(toolMsg["tool_call_id"]).toBe("toolu_01");
    expect(toolMsg["content"]).toBe("Tool 'create_task' executed successfully.");
    // OpenAI has no is_error field
    expect(toolMsg["is_error"]).toBeUndefined();
  });
});

// ---- OAI-RT-3: string content messages passed through unchanged --------------

describe("OAI-RT-3: string content messages passed through unchanged (backward compat)", () => {
  beforeEach(() => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_ai_provider") return "openai-compatible";
      if (key === "xai_ai_base_url") return "https://api.groq.com/openai/v1";
      return null;
    });
  });

  it("string-content user and assistant messages are passed through as-is", () => {
    const config = resolveProvider("sk-test");

    const messages = [
      { role: "user" as const, content: "hello" },
      { role: "assistant" as const, content: "hello back" },
    ];

    const body = config.buildBody({
      modelId: "llama3-8b",
      messages,
      stream: true,
    });

    const sentMessages = body["messages"] as Array<Record<string, unknown>>;
    expect(sentMessages).toHaveLength(2);
    expect(sentMessages[0]).toEqual({ role: "user", content: "hello" });
    expect(sentMessages[1]).toEqual({ role: "assistant", content: "hello back" });
  });

  it("Anthropic branch messages also pass through verbatim (byte-stable)", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_ai_provider") return "anthropic";
      return null;
    });
    const config = resolveProvider("sk-ant-test");
    expect(config.provider).toBe("anthropic");

    const messages = [
      { role: "user" as const, content: "hi" },
      {
        role: "assistant" as const,
        content: [{ type: "tool_use" as const, id: "toolu_01", name: "create_task", input: { title: "t" } }],
      },
      {
        role: "user" as const,
        content: [{ type: "tool_result" as const, tool_use_id: "toolu_01", content: "ok", is_error: false }],
      },
    ];

    const body = config.buildBody({ modelId: "claude-haiku-4-5-20251101", messages, stream: true });
    const sentMessages = body["messages"] as typeof messages;
    // Anthropic branch: messages passed verbatim (content blocks preserved as-is)
    expect(sentMessages[1]!.content).toEqual(messages[1]!.content);
    expect((sentMessages[2]!.content as Array<{type:string}>)[0]!.type).toBe("tool_result");
  });
});

// ---- OAI-PARITY-1: Anthropic vs openai golden SSE → identical toolUse ------

describe("OAI-PARITY-1: Anthropic golden SSE vs openai golden SSE → identical normalized toolUse", () => {
  it("both providers yield the same StreamChunk.toolUse {id,name,input} shape", async () => {
    // --- Anthropic golden (TU-2 sequence, mocked) ---
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_ai_provider") return "anthropic";
      if (key === "xai_ai_streaming") return true;
      return null;
    });
    mockLoadKey.mockResolvedValue("sk-ant-test");

    const anthropicSse = [
      `event: content_block_start\ndata: ${JSON.stringify({
        type: "content_block_start",
        index: 0,
        content_block: { type: "tool_use", id: "call_parity", name: "create_task", input: {} },
      })}\n\n`,
      `event: content_block_delta\ndata: ${JSON.stringify({
        type: "content_block_delta",
        index: 0,
        delta: { type: "input_json_delta", partial_json: '{"title":"Parity task"}' },
      })}\n\n`,
      `event: content_block_stop\ndata: ${JSON.stringify({ type: "content_block_stop", index: 0 })}\n\n`,
      `event: message_delta\ndata: ${JSON.stringify({
        type: "message_delta",
        delta: { stop_reason: "tool_use" },
      })}\n\n`,
      `event: message_stop\ndata: ${JSON.stringify({ type: "message_stop" })}\n\n`,
    ].join("");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeStream(anthropicSse), { status: 200 }),
    );

    const anthropicChunks = await collectChunks(
      streamCompleteChat({ text: "create task", lang: "en", model: "haiku" }),
    );
    const anthropicFinal = anthropicChunks[anthropicChunks.length - 1]!;
    expect(anthropicFinal.toolUse).toBeDefined();

    // --- OpenAI golden (OAI-STREAM-1 sequence) ---
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_ai_provider") return "openai-compatible";
      if (key === "xai_ai_base_url") return "https://api.groq.com/openai/v1";
      if (key === "xai_ai_streaming") return true;
      return null;
    });
    mockLoadKey.mockResolvedValue("gsk-test-key");

    const openaiSse = [
      sseData({
        choices: [{
          index: 0,
          delta: {
            tool_calls: [{
              index: 0,
              id: "call_parity",
              type: "function",
              function: { name: "create_task", arguments: "" },
            }],
          },
          finish_reason: null,
        }],
      }),
      sseData({
        choices: [{
          index: 0,
          delta: {
            tool_calls: [{
              index: 0,
              function: { arguments: '{"title":"Parity task"}' },
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
      new Response(makeStream(openaiSse), { status: 200 }),
    );

    const openaiChunks = await collectChunks(
      streamCompleteChat({ text: "create task", lang: "en", model: "haiku" }),
    );
    const oaiFinal = openaiChunks[openaiChunks.length - 1]!;
    expect(oaiFinal.toolUse).toBeDefined();

    // Both providers converge on identical normalized toolUse
    expect(anthropicFinal.toolUse).toMatchObject({
      id: "call_parity",
      name: "create_task",
      input: { title: "Parity task" },
    });
    expect(oaiFinal.toolUse).toMatchObject({
      id: "call_parity",
      name: "create_task",
      input: { title: "Parity task" },
    });
    // The normalized shapes are structurally identical
    expect(anthropicFinal.toolUse).toEqual(oaiFinal.toolUse);
  });
});

// ---- OAI-PARITY-2: same toolUse.input → same toWriteEvent payload ----------

describe("OAI-PARITY-2: same toolUse.input → same toWriteEvent payload (provider-agnostic event path)", () => {
  it("findTool(name).toWriteEvent produces identical event payload from normalized input regardless of source provider", () => {
    const toolInput = { title: "Buy groceries", bucket: "next7" };
    const toolId = "call_parity_ev";

    const tool = findTool("create_task");
    expect(tool).toBeDefined();

    // Simulate the event that would be emitted from Anthropic toolUse.
    const anthropicSimulatedInput = { ...toolInput }; // same input shape
    const anthropicSpec = tool!.toWriteEvent(anthropicSimulatedInput, toolId);

    // Simulate the event that would be emitted from openai toolUse (same normalized input).
    const openaiSimulatedInput = { ...toolInput }; // same normalized input from JSON.parse
    const openaiSpec = tool!.toWriteEvent(openaiSimulatedInput, toolId);

    // Both produce identical channel + payload (modulo requestedAt timestamp).
    expect(anthropicSpec.channel).toBe("web:tasks:create-requested");
    expect(openaiSpec.channel).toBe("web:tasks:create-requested");
    expect(anthropicSpec.payload["requestId"]).toBe(openaiSpec.payload["requestId"]);
    expect(anthropicSpec.payload["title"]).toBe(openaiSpec.payload["title"]);
    expect(anthropicSpec.payload["bucket"]).toBe(openaiSpec.payload["bucket"]);
    // requestedAt is a timestamp — it will differ by milliseconds at most but both are ISO strings.
    expect(typeof anthropicSpec.payload["requestedAt"]).toBe("string");
    expect(typeof openaiSpec.payload["requestedAt"]).toBe("string");
  });
});
