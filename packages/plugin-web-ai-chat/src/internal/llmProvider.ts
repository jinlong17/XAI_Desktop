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
import type { AnthropicToolDef, ContentBlock } from "./toolUseTypes.js";

// ---- Model id constants (pinned per Rec3, 2026-05-25) ----------------------
// Exact Anthropic model id strings — pinned to known-good versions.
// Update here when Anthropic releases a new model version.
// Ref: https://docs.anthropic.com/en/docs/models-overview (checked 2026-05-25)

export const ANTHROPIC_MODEL_IDS: Readonly<Record<AiModelId, string>> = Object.freeze({
  haiku: "claude-haiku-4-5-20251101",
  sonnet: "claude-sonnet-4-5-20251001",
  opus: "claude-opus-4-5-20251001",
});

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
   * - Optional tools array (Anthropic branch only) for tool-use requests.
   * - Optional toolChoice (Anthropic branch only). Default: omitted → "auto".
   */
  buildBody(opts: {
    modelId: string;
    messages: Array<{ role: "user" | "assistant"; content: string | ContentBlock[] }>;
    stream: boolean;
    maxTokens?: number;
    /** Optional: Anthropic tool definitions (not sent for openai-compatible). */
    tools?: AnthropicToolDef[];
    /** Optional: tool_choice override (default "auto" when tools present). */
    toolChoice?: { type: "auto" | "any" | "none" } | { type: "tool"; name: string };
  }): Record<string, unknown>;
  /** The real provider-specific model id for the given AiModelId. */
  resolveModelId(model: AiModelId): string;
  /** Provider kind — for error categorization. */
  provider: AiProviderKind;
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
    const cleanBase = baseUrl.replace(/\/$/, "");
    const url = `${cleanBase}/chat/completions`;
    return {
      url,
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
      },
      buildBody({ modelId, messages, stream, maxTokens }) {
        // OpenAI-compatible: tools are NOT sent (deferred per planner's-call #3).
        const body: Record<string, unknown> = {
          model: modelId,
          messages,
          stream,
        };
        if (maxTokens !== undefined) body["max_tokens"] = maxTokens;
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
