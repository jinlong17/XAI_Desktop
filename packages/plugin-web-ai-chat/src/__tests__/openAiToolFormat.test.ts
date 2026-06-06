/**
 * openAiToolFormat.test.ts — OAI-FMT-1..3 + OAI-CHOICE-1..4 + OAI-TOOLS-1
 *
 * Tests for the OpenAI tool-def serializers in toolUseTypes.ts and the
 * llmProvider.ts openai buildBody branch now sending tools in OpenAI format.
 *
 * OAI-FMT-1: toOpenAiTools maps {name,description,input_schema} → OpenAI function format
 * OAI-FMT-2: toOpenAiTools drops input_examples (Anthropic-only quality hint)
 * OAI-FMT-3: toOpenAiTools handles multiple tool defs
 * OAI-CHOICE-1: toOpenAiToolChoice maps auto → "auto"
 * OAI-CHOICE-2: toOpenAiToolChoice maps any → "required"
 * OAI-CHOICE-3: toOpenAiToolChoice maps none → "none"
 * OAI-CHOICE-4: toOpenAiToolChoice maps tool → {type:"function", function:{name}}
 * OAI-TOOLS-1: openai buildBody serializes tools in OpenAI format when present
 *              + no-tools → undefined (backward compat)
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension
 * API contract: packages/xai-web-ai-chat/docs/api.md §15.1-15.2
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §10.1
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  toOpenAiTools,
  toOpenAiToolChoice,
  type AnthropicToolDef,
  type OpenAiToolDef,
} from "../internal/toolUseTypes.js";
import { resolveProvider } from "../internal/llmProvider.js";

// ---- Test fixtures -----------------------------------------------------------

const TOOL_A: AnthropicToolDef = {
  name: "create_task",
  description: "Create a new task in the user's task list.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Task title." },
    },
    required: ["title"],
  },
};

const TOOL_B: AnthropicToolDef = {
  name: "create_calendar_event",
  description: "Create a new calendar event.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Event title." },
      date: { type: "string", description: "Local date in YYYY-MM-DD." },
    },
    required: ["title", "date"],
  },
  // NOTE: input_examples is Anthropic-only and must be dropped in OpenAI format
  input_examples: [
    { title: "Team standup", date: "2026-05-30" },
  ],
};

// ---- OAI-FMT-1: toOpenAiTools maps to OpenAI function format ----------------

describe("OAI-FMT-1: toOpenAiTools maps AnthropicToolDef → OpenAI function format", () => {
  it("wraps each tool in {type:'function', function:{name,description,parameters}}", () => {
    const result = toOpenAiTools([TOOL_A]);
    expect(result).toHaveLength(1);

    const oaiTool = result[0]!;
    expect(oaiTool.type).toBe("function");
    expect(oaiTool.function.name).toBe("create_task");
    expect(oaiTool.function.description).toBe("Create a new task in the user's task list.");
    expect(oaiTool.function.parameters).toEqual(TOOL_A.input_schema);
  });

  it("parameters field equals input_schema exactly (same object)", () => {
    const result = toOpenAiTools([TOOL_A]);
    const oaiTool = result[0]!;
    // parameters IS input_schema (same structure, properties and required)
    expect(oaiTool.function.parameters.type).toBe("object");
    expect(oaiTool.function.parameters.properties).toEqual(TOOL_A.input_schema.properties);
    expect(oaiTool.function.parameters.required).toEqual(TOOL_A.input_schema.required);
  });
});

// ---- OAI-FMT-2: toOpenAiTools drops input_examples -------------------------

describe("OAI-FMT-2: toOpenAiTools drops input_examples (Anthropic-only field)", () => {
  it("does not include input_examples in the OpenAI function schema", () => {
    // TOOL_B has input_examples — must be absent from OpenAI format
    const result = toOpenAiTools([TOOL_B]);
    const oaiTool = result[0]!;

    expect("input_examples" in oaiTool).toBe(false);
    expect("input_examples" in oaiTool.function).toBe(false);
    expect("input_examples" in oaiTool.function.parameters).toBe(false);
  });
});

// ---- OAI-FMT-3: toOpenAiTools handles multiple tool defs --------------------

describe("OAI-FMT-3: toOpenAiTools handles multiple tool definitions", () => {
  it("maps all tools correctly preserving order", () => {
    const result = toOpenAiTools([TOOL_A, TOOL_B]);
    expect(result).toHaveLength(2);

    const [toolA, toolB] = result as [OpenAiToolDef, OpenAiToolDef];
    expect(toolA.function.name).toBe("create_task");
    expect(toolB.function.name).toBe("create_calendar_event");
  });

  it("empty array returns empty array", () => {
    const result = toOpenAiTools([]);
    expect(result).toEqual([]);
  });
});

// ---- OAI-CHOICE-1: toOpenAiToolChoice maps auto → "auto" -------------------

describe("OAI-CHOICE-1: toOpenAiToolChoice maps {type:'auto'} → 'auto'", () => {
  it("returns 'auto' for Anthropic auto choice", () => {
    expect(toOpenAiToolChoice({ type: "auto" })).toBe("auto");
  });

  it("returns undefined for undefined (omitted → OpenAI default auto)", () => {
    expect(toOpenAiToolChoice(undefined)).toBeUndefined();
  });
});

// ---- OAI-CHOICE-2: toOpenAiToolChoice maps any → "required" ----------------

describe("OAI-CHOICE-2: toOpenAiToolChoice maps {type:'any'} → 'required'", () => {
  it("returns 'required' for Anthropic any choice", () => {
    expect(toOpenAiToolChoice({ type: "any" })).toBe("required");
  });
});

// ---- OAI-CHOICE-3: toOpenAiToolChoice maps none → "none" -------------------

describe("OAI-CHOICE-3: toOpenAiToolChoice maps {type:'none'} → 'none'", () => {
  it("returns 'none' for Anthropic none choice", () => {
    expect(toOpenAiToolChoice({ type: "none" })).toBe("none");
  });
});

// ---- OAI-CHOICE-4: toOpenAiToolChoice maps tool → {type:"function",...} ----

describe("OAI-CHOICE-4: toOpenAiToolChoice maps {type:'tool',name} → {type:'function',function:{name}}", () => {
  it("returns OpenAI specific-function format for Anthropic tool choice", () => {
    const result = toOpenAiToolChoice({ type: "tool", name: "create_task" });
    expect(result).toEqual({ type: "function", function: { name: "create_task" } });
  });
});

// ---- OAI-TOOLS-1: openai buildBody serializes tools in OpenAI format --------

describe("OAI-TOOLS-1: openai buildBody sends tools in OpenAI function format + backward compat", () => {
  beforeEach(() => {
    localStorage.setItem("xai_ai_provider", JSON.stringify("openai-compatible"));
    localStorage.setItem("xai_ai_base_url", JSON.stringify("https://api.groq.com/openai/v1"));
  });

  it("serializes tools in OpenAI function format when provided", () => {
    const config = resolveProvider("sk-groq-test");
    expect(config.provider).toBe("openai-compatible");

    const body = config.buildBody({
      modelId: "llama3-8b",
      messages: [{ role: "user", content: "hello" }],
      stream: true,
      tools: [TOOL_A, TOOL_B],
    });

    // Tools MUST be present and in OpenAI format
    expect(body["tools"]).toBeDefined();
    const tools = body["tools"] as OpenAiToolDef[];
    expect(tools).toHaveLength(2);

    // First tool: create_task
    expect(tools[0]!.type).toBe("function");
    expect(tools[0]!.function.name).toBe("create_task");
    expect(tools[0]!.function.parameters).toEqual(TOOL_A.input_schema);

    // Second tool: create_calendar_event — input_examples dropped
    expect(tools[1]!.type).toBe("function");
    expect(tools[1]!.function.name).toBe("create_calendar_event");
    expect("input_examples" in tools[1]!.function).toBe(false);
  });

  it("no-tools call: tools absent from body (backward compat — R1)", () => {
    const config = resolveProvider("sk-groq-test");

    const body = config.buildBody({
      modelId: "llama3-8b",
      messages: [{ role: "user", content: "hello" }],
      stream: true,
      // tools: not provided
    });

    // Without tools, the body must not have a tools key
    expect(body["tools"]).toBeUndefined();
    expect(body["tool_choice"]).toBeUndefined();
  });

  it("tool_choice is serialized to OpenAI format when provided", () => {
    const config = resolveProvider("sk-groq-test");

    const body = config.buildBody({
      modelId: "llama3-8b",
      messages: [{ role: "user", content: "hello" }],
      stream: true,
      tools: [TOOL_A],
      toolChoice: { type: "any" },
    });

    expect(body["tool_choice"]).toBe("required");
  });

  it("tool_choice omitted → not added to body (OpenAI defaults to auto)", () => {
    const config = resolveProvider("sk-groq-test");

    const body = config.buildBody({
      modelId: "llama3-8b",
      messages: [{ role: "user", content: "hello" }],
      stream: true,
      tools: [TOOL_A],
      // toolChoice: not provided
    });

    // tool_choice should not be set when omitted
    expect(body["tool_choice"]).toBeUndefined();
  });

  it("Anthropic branch still passes tools verbatim (Anthropic byte-stable, OAI-REG)", () => {
    // Reset to Anthropic
    localStorage.removeItem("xai_ai_provider");
    localStorage.removeItem("xai_ai_base_url");

    const config = resolveProvider("sk-ant-test");
    expect(config.provider).toBe("anthropic");

    const body = config.buildBody({
      modelId: "claude-haiku-4-5-20251101",
      messages: [{ role: "user", content: "hello" }],
      stream: true,
      tools: [TOOL_A],
    });

    // Anthropic branch passes tools verbatim (AnthropicToolDef shape, NOT OpenAI format)
    const tools = body["tools"] as AnthropicToolDef[];
    expect(tools).toHaveLength(1);
    expect(tools[0]!.name).toBe("create_task");
    expect(tools[0]!.input_schema).toBeDefined();
    // Anthropic format has no "type":"function" wrapper
    expect((tools[0] as unknown as Record<string, unknown>)["type"]).toBeUndefined();
  });
});
