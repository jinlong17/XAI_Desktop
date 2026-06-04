/**
 * llmProvider — resolves provider config from preference snapshot.
 *
 * Reads xai_ai_* prefs via the imperative getPref() helper (NOT usePref hook)
 * because this module runs inside async adapter functions, not React components.
 * Per Rec2 clarification: "resolveProvider reads xai_* keys via direct
 * localStorage read (the SHIPPED reader-helper sibling pattern in
 * @repo/plugin-web-storage)".
 *
 * Design: packages/xai-web-ai-chat/docs/design.md FA-3 (2026-05-25 Extension)
 * API contract: packages/xai-web-ai-chat/docs/api.md §12.1 (resolveProvider)
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 (llmProvider)
 */

import { getPref } from "@repo/plugin-web-storage";
import type { AiModelId } from "../types.js";
import type { AnthropicToolDef, ContentBlock, ToolUseBlock, ToolResultBlock } from "./toolUseTypes.js";
import { toOpenAiTools, toOpenAiToolChoice } from "./toolUseTypes.js";

// ---- Model id constants (pinned per Rec3, 2026-05-25) ----------------------
// Exact Anthropic model id strings — pinned to known-good versions.
// Update here when Anthropic releases a new model version.
// Ref: https://docs.anthropic.com/en/docs/models-overview (checked 2026-05-25)

export const ANTHROPIC_MODEL_IDS: Readonly<Record<AiModelId, string>> = Object.freeze({
  haiku: "claude-haiku-4-5-20251101",
  sonnet: "claude-sonnet-4-5-20251001",
  opus: "claude-opus-4-5-20251001",
});

const OPENAI_COMPATIBLE_ALLOWED_ORIGINS = new Set([
  "https://api.openai.com",
  "https://api.groq.com",
  "https://generativelanguage.googleapis.com",
]);

// OpenAI-compatible model id pass-through: the user's model string is used as-is.
// The real model id depends on the OpenAI-compatible provider (e.g. Groq).

// ---- Types -----------------------------------------------------------------

export type AiProviderKind = "anthropic" | "openai-compatible";

export interface ProviderConfig {
  /** Full endpoint URL. */
  url: string;
  /** HTTP headers to include in every request. */
  headers: Record<string, string>;
  /**
   * Builds the JSON request body.
   *
   * P2 widening (additive, backward-compatible):
   * - messages[].content widened from string → string | ContentBlock[]
   *   so tool round-trip turns can carry assistant tool_use + user tool_result.
   * - Optional tools array: sent on BOTH providers. Anthropic branch passes
   *   verbatim AnthropicToolDef (input_schema); openai branch serializes via
   *   toOpenAiTools() into the OpenAI function format (parameters field).
   * - Optional toolChoice: sent on BOTH providers. Anthropic passes verbatim;
   *   openai serializes via toOpenAiToolChoice(). Default: omitted → "auto".
   */
  buildBody(opts: {
    modelId: string;
    messages: Array<{ role: "user" | "assistant"; content: string | ContentBlock[] }>;
    stream: boolean;
    maxTokens?: number;
    /** Optional: tool definitions. Anthropic branch passes verbatim; openai branch serializes via toOpenAiTools. */
    tools?: AnthropicToolDef[];
    /** Optional: tool_choice override (default "auto" when tools present). */
    toolChoice?: { type: "auto" | "any" | "none" } | { type: "tool"; name: string };
  }): Record<string, unknown>;
  /** The real provider-specific model id for the given AiModelId. */
  resolveModelId(model: AiModelId): string;
  /** Provider kind — for error categorization. */
  provider: AiProviderKind;
}

// ---- OpenAI message translation --------------------------------------------

/**
 * Translates an array of messages from Anthropic content-block shape to
 * OpenAI Chat Completions wire format.
 *
 * AiChatModule builds round-trip turns in Anthropic format (§2.6 finding).
 * This translator is the single seam in the openai buildBody branch;
 * AiChatModule, streamCompleteChat, and the Anthropic branch stay untouched.
 *
 * Translation rules (discovery §3.3 + api §15.3):
 *
 *   String content → unchanged (role: "user"|"assistant", content: string)
 *
 *   assistant ContentBlock[] where content[0].type === "tool_use":
 *     → { role: "assistant", content: null, tool_calls: [
 *          { id, type: "function", function: { name, arguments: JSON.stringify(input) } }
 *        ] }
 *
 *   user ContentBlock[] where content[0].type === "tool_result":
 *     → { role: "tool", tool_call_id: content[0].tool_use_id, content: content[0].content }
 *
 *   Other ContentBlock[] (e.g. text blocks) → passed through as-is (best-effort).
 *
 * @internal
 */
function _translateMessagesToOpenAi(
  messages: Array<{ role: "user" | "assistant"; content: string | ContentBlock[] }>,
): unknown[] {
  const result: unknown[] = [];
  for (const msg of messages) {
    if (typeof msg.content === "string") {
      // Plain string message — pass through unchanged.
      result.push({ role: msg.role, content: msg.content });
      continue;
    }

    const blocks = msg.content;

    // Assistant turn with a tool_use block → OpenAI assistant + tool_calls array.
    if (msg.role === "assistant" && blocks.length > 0 && blocks[0]?.type === "tool_use") {
      const toolUseBlock = blocks[0] as ToolUseBlock;
      result.push({
        role: "assistant",
        content: null,
        tool_calls: [{
          id: toolUseBlock.id,
          type: "function",
          function: {
            name: toolUseBlock.name,
            arguments: JSON.stringify(toolUseBlock.input),
          },
        }],
      });
      continue;
    }

    // User turn with a tool_result block → OpenAI "tool"-role message.
    if (msg.role === "user" && blocks.length > 0 && blocks[0]?.type === "tool_result") {
      const resultBlock = blocks[0] as ToolResultBlock;
      // OpenAI has no is_error field; a declined/errored result is conveyed as plain content text.
      result.push({
        role: "tool",
        tool_call_id: resultBlock.tool_use_id,
        content: resultBlock.content,
      });
      continue;
    }

    // Other ContentBlock[] (text blocks, etc.) — pass through best-effort.
    result.push({ role: msg.role, content: blocks });
  }
  return result;
}

// ---- resolveProvider -------------------------------------------------------

/**
 * Returns a ProviderConfig based on the current preference snapshot.
 * Reads prefs via imperative getPref() (localStorage reader — no hooks).
 *
 * Throws a typed config error if openai-compatible is selected but no base URL
 * is configured.
 */
export function resolveProvider(apiKey: string): ProviderConfig {
  const provider = (getPref("xai_ai_provider") as string) || "anthropic";
  const baseUrl = (getPref("xai_ai_base_url") as string) || "";

  if (provider === "openai-compatible") {
    if (!baseUrl.trim()) {
      throw new Error(
        "[llmProvider] OpenAI-compatible selected but no base URL configured. " +
          "Please set the base URL in Settings → AI.",
      );
    }
    let parsedBase: URL;
    try {
      parsedBase = new URL(baseUrl);
    } catch {
      throw new Error("[llmProvider] OpenAI-compatible base URL is invalid.");
    }
    if (!OPENAI_COMPATIBLE_ALLOWED_ORIGINS.has(parsedBase.origin)) {
      throw new Error(
        "[llmProvider] OpenAI-compatible base URL is not allowlisted by the Web CSP. " +
          "Use OpenAI, Groq, or Gemini endpoints.",
      );
    }
    const cleanBase = baseUrl.replace(/\/$/, "");
    const url = `${cleanBase}/chat/completions`;
    return {
      url,
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
      },
      buildBody({ modelId, messages, stream, maxTokens, tools, toolChoice }) {
        // Translate messages from Anthropic content-block shape to OpenAI wire format.
        // AiChatModule builds priorMessages in Anthropic format (§2.6 finding);
        // the adapter is the single translation seam — AiChatModule stays byte-stable.
        const openAiMessages = _translateMessagesToOpenAi(messages);

        const body: Record<string, unknown> = {
          model: modelId,
          messages: openAiMessages,
          stream,
        };
        if (maxTokens !== undefined) body["max_tokens"] = maxTokens;
        // Serialize tools in OpenAI function-calling format when provided.
        if (tools && tools.length > 0) {
          body["tools"] = toOpenAiTools(tools);
          const oaiChoice = toOpenAiToolChoice(toolChoice);
          if (oaiChoice !== undefined) {
            body["tool_choice"] = oaiChoice;
          }
          // Default tool_choice is "auto" (omitted = OpenAI default).
        }
        return body;
      },
      resolveModelId(model) {
        // OpenAI-compatible: pass the AiModelId through as-is — the user's
        // provider is responsible for mapping model names.
        return model;
      },
      provider: "openai-compatible",
    };
  }

  // Default: Anthropic
  return {
    url: "https://api.anthropic.com/v1/messages",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // Required for direct browser access (CORS).
      "anthropic-dangerous-direct-browser-access": "true",
    },
    buildBody({ modelId, messages, stream, maxTokens, tools, toolChoice }) {
      const body: Record<string, unknown> = {
        model: modelId,
        messages,
        stream,
        max_tokens: maxTokens ?? 1024,
      };
      // Emit tools + tool_choice only when tools are provided (Anthropic branch).
      if (tools && tools.length > 0) {
        body["tools"] = tools;
        if (toolChoice !== undefined) {
          body["tool_choice"] = toolChoice;
        }
        // Default tool_choice is "auto" (omitted = Anthropic default).
      }
      return body;
    },
    resolveModelId(model) {
      return ANTHROPIC_MODEL_IDS[model] ?? ANTHROPIC_MODEL_IDS["haiku"];
    },
    provider: "anthropic",
  };
}
