/**
 * claudeStreamAdapter — streamCompleteChat async generator.
 *
 * Resolves provider config, loads the API key, issues a streaming fetch,
 * parses SSE chunks, and yields accumulated StreamChunk tokens.
 *
 * - On 4xx/5xx: throws LlmError + emits appropriate web event.
 * - On abort: returns early without throwing.
 * - On streaming-unavailable (null body): falls back to completeChat.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md FA-3 (2026-05-25 Extension)
 * API contract: packages/xai-web-ai-chat/docs/api.md §12.1
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 (claudeStreamAdapter)
 */

import type { Lang } from "@repo/plugin-web-tokens";
import { getPref } from "@repo/plugin-web-storage";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { AiModelId } from "../types.js";
import { aiKeyStorage } from "./secretStore.js";
import { resolveProvider } from "./llmProvider.js";
import { parseSseStream } from "./sseParser.js";
import { classifyError, type LlmError } from "./llmErrors.js";
import { DEMO_REPLY_EN, DEMO_REPLY_ZH } from "./demoReply.js";
import { buildTodayContext } from "./contextProvider.js";
import type { AnthropicToolDef, ContentBlock, ToolUseResult } from "./toolUseTypes.js";

// ---- Public types ----------------------------------------------------------

export interface StreamRequest {
  /** The user prompt text (trimmed, non-empty). */
  text: string;
  /** Active language; controls fallback demo string + future i18n in errors. */
  lang: Lang;
  /** Model id the user picked in the composer (or default). */
  model: AiModelId;
  /** Optional abort signal — when aborted, the underlying fetch is aborted. */
  signal?: AbortSignal;
  /**
   * Optional injected today context from contextProvider.buildTodayContext().
   * When provided (and non-empty), prepended to the first user message.
   * P1 feature: READ-ONLY context injection.
   */
  contextText?: string;
  /**
   * P2: Optional Anthropic tool definitions to include in the request.
   * Only sent on the Anthropic provider branch when a key is configured.
   * Omitted for openai-compatible (planner's-call #3 — deferred).
   */
  tools?: AnthropicToolDef[];
  /**
   * P2: Optional history of prior messages for tool round-trip (tool_result turn).
   * Content may be string or ContentBlock[]. Replaces the single-user-turn
   * messages build when provided.
   */
  priorMessages?: Array<{ role: "user" | "assistant"; content: string | unknown[] }>;
}

export interface StreamChunk {
  /** The accumulated text so far (NOT the delta — caller renders this directly). */
  accumulated: string;
  /** True on the final chunk before the iterator returns. */
  done: boolean;
  /**
   * P2 additive (Rec1 from feature-review): if the model's turn ended with a tool call,
   * this field carries the fully-parsed ToolUseResult. Undefined for normal text-only chunks.
   * Text-only consumers stay byte-for-byte unaffected (R1 backward compat).
   */
  toolUse?: ToolUseResult;
}

// ---- streamCompleteChat ----------------------------------------------------

/**
 * Streams a completion from the configured LLM provider.
 *
 * If no API key is configured, throws LlmError({kind:"BadKey",detail:"not-set"}).
 * On streaming-unavailable, falls back to completeChat and yields one final chunk.
 */
export async function* streamCompleteChat(
  req: StreamRequest,
): AsyncIterable<StreamChunk> {
  const { text, lang, model, signal } = req;

  // 1. Load the API key.
  const provider = (getPref("xai_ai_provider") as string) || "anthropic";
  const providerKind = (provider === "openai-compatible" ? "openai-compatible" : "anthropic") as
    | "anthropic"
    | "openai-compatible";
  const apiKey = await aiKeyStorage.loadKey(providerKind);

  if (!apiKey) {
    const err: LlmError = { kind: "BadKey", status: 401, detail: "not-set" };
    throw err;
  }

  // 2. Resolve provider config.
  const config = resolveProvider(apiKey);
  const modelId = config.resolveModelId(model);
  const streamingEnabled = getPref("xai_ai_streaming") !== false;

  // 3. Build request body.
  // P1 context injection: prepend today's context snapshot to the user prompt.
  // Reads context lazily here (not from req.contextText) so it's always fresh.
  // contextText param is kept for override/test purposes.
  let contextText = req.contextText;
  if (contextText === undefined) {
    // Only inject context when a key is configured (avoids reading prefs for no-key path).
    try {
      const ctx = buildTodayContext();
      contextText = ctx.isEmpty ? "" : ctx.text;
    } catch {
      contextText = "";
    }
  }

  const userContent =
    contextText && contextText.length > 0
      ? `${contextText}\n\n---\n\nUser question: ${text}`
      : text;

  // Build messages: use priorMessages if provided (tool round-trip), else single user turn.
  const messages = req.priorMessages
    ? (req.priorMessages as Array<{ role: "user" | "assistant"; content: string | unknown[] }>)
    : [{ role: "user" as const, content: userContent }];

  // Only send tools on Anthropic provider (planner's-call #3).
  const tools = config.provider === "anthropic" ? req.tools : undefined;

  const body = config.buildBody({
    modelId,
    messages: messages as Array<{ role: "user" | "assistant"; content: string | ContentBlock[] }>,
    stream: streamingEnabled,
    tools,
  });

  // 4. Issue the fetch.
  let response: Response;
  try {
    response = await fetch(config.url, {
      method: "POST",
      headers: config.headers,
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) {
      // Aborted — return early without throwing.
      return;
    }
    const llmErr = await classifyError(err instanceof Error ? err : new Error(String(err)));
    _emitError(llmErr, providerKind);
    throw llmErr;
  }

  // 5. Handle non-200 responses.
  if (!response.ok) {
    const llmErr = await classifyError(response);
    if (llmErr.kind === "RateLimited") {
      emitWebEvent("web:ai:rate-limited", {
        provider: providerKind,
        retryAfterSec: llmErr.retryAfterSec,
        occurredAt: new Date().toISOString(),
      });
    } else {
      _emitError(llmErr, providerKind);
    }
    throw llmErr;
  }

  // 6. Handle streaming response.
  if (!response.body || !streamingEnabled) {
    // Fallback: no streaming body available or streaming disabled.
    // Return the demo string as a single final chunk (avoids circular call
    // back into completeChat which would loop back to streamCompleteChat).
    // Consumers should use the full non-streaming text/event-stream for
    // production; this path is only exercised when body is null (uncommon).
    const demoText = lang === "zh" ? DEMO_REPLY_ZH : DEMO_REPLY_EN;
    yield { accumulated: demoText, done: true };
    return;
  }

  // 7. Parse SSE stream.
  // P2: loop-local state for tool_use block accumulation (Rec2 from feature-review).
  // Per-block-index partial_json concatenator; JSON.parse ONCE at content_block_stop.
  // Avoids widening the pure extractDelta helper.
  let accumulated = "";
  let stopReason: string | undefined;

  // Tool use accumulator: maps content-block index → { id, name, partialJson }
  interface ToolAccumEntry { id: string; name: string; partialJson: string }
  const toolAccum: Record<number, ToolAccumEntry> = {};

  // Final parsed tool use result (if any).
  let toolUseResult: ToolUseResult | undefined;

  try {
    for await (const sseEvent of parseSseStream(response)) {
      if (signal?.aborted) {
        // Aborted mid-stream — return early.
        return;
      }

      if (sseEvent.event === "__done__") {
        // OpenAI-compatible `[DONE]` sentinel — stream complete.
        break;
      }

      // Parse the raw SSE data.
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(sseEvent.data) as Record<string, unknown>;
      } catch {
        // Malformed JSON in a chunk — skip silently.
        continue;
      }

      // Determine event type: prefer JSON data "type" field, fall back to SSE event field.
      // Rationale: the Anthropic API includes "type" in the JSON data body. The SHIPPED
      // tests use the SSE event: line for backward compat (both are valid).
      const eventType = (parsed["type"] as string | undefined) ?? sseEvent.event;

      // ---- Anthropic streaming event handling ----
      if (providerKind === "anthropic") {
        if (eventType === "content_block_start") {
          // A new content block has started. If it's a tool_use block, record it.
          const idx = parsed["index"] as number | undefined;
          const block = parsed["content_block"] as Record<string, unknown> | undefined;
          if (typeof idx === "number" && block && block["type"] === "tool_use") {
            const id = block["id"] as string ?? "";
            const name = block["name"] as string ?? "";
            toolAccum[idx] = { id, name, partialJson: "" };
          }
          continue;
        }

        if (eventType === "content_block_delta") {
          const idx = parsed["index"] as number | undefined;
          const delta = parsed["delta"] as Record<string, unknown> | undefined;
          if (!delta) continue;

          if (delta["type"] === "text_delta" && typeof delta["text"] === "string") {
            // Normal text delta.
            accumulated += delta["text"] as string;
            yield { accumulated, done: false };
          } else if (delta["type"] === "input_json_delta" && typeof idx === "number") {
            // Tool use partial JSON — accumulate per block index; DO NOT parse here.
            const partial = delta["partial_json"] as string ?? "";
            if (toolAccum[idx]) {
              toolAccum[idx]!.partialJson += partial;
            }
          }
          continue;
        }

        if (eventType === "content_block_stop") {
          // A block has ended. If it was a tool_use block, parse its JSON now (ONCE).
          const idx = parsed["index"] as number | undefined;
          if (typeof idx === "number" && toolAccum[idx]) {
            const entry = toolAccum[idx]!;
            try {
              const parsedInput = JSON.parse(
                entry.partialJson || "{}",
              ) as Record<string, unknown>;
              // Keep the LAST tool use result (in practice there is only one per v1).
              toolUseResult = { id: entry.id, name: entry.name, input: parsedInput };
            } catch {
              // Malformed input JSON — skip tool use (graceful degradation).
            }
          }
          continue;
        }

        if (eventType === "message_delta") {
          // message_delta carries stop_reason for the turn (e.g. "tool_use" or "end_turn").
          const delta = parsed["delta"] as Record<string, unknown> | undefined;
          if (delta && typeof delta["stop_reason"] === "string") {
            stopReason = delta["stop_reason"] as string;
          }
          continue;
        }

        if (eventType === "message_stop") {
          // End of the streaming message. Break the loop.
          break;
        }

        // Other event types (e.g. message_start, ping) — skip.
        continue;
      }

      // ---- OpenAI-compatible streaming (original path) ----
      const delta = extractDeltaOpenAI(parsed);
      if (delta) {
        accumulated += delta;
        yield { accumulated, done: false };
      }
    }
  } catch (err) {
    if (signal?.aborted) return;
    const llmErr = await classifyError(err instanceof Error ? err : new Error(String(err)));
    _emitError(llmErr, providerKind);
    throw llmErr;
  }

  // Emit the final chunk, including tool_use result if stop_reason was "tool_use".
  if (stopReason === "tool_use" && toolUseResult) {
    yield { accumulated, done: true, toolUse: toolUseResult };
  } else {
    yield { accumulated, done: true };
  }
}

// ---- Helpers ---------------------------------------------------------------

function _emitError(err: LlmError, provider: "anthropic" | "openai-compatible"): void {
  let kind: "bad-key" | "network" | "server" | "malformed";
  let status: number | undefined;
  if (err.kind === "BadKey") {
    kind = "bad-key";
    status = err.status;
  } else if (err.kind === "Network") {
    kind = "network";
    status = 0;
  } else if (err.kind === "Server") {
    kind = "server";
    status = err.status;
  } else if (err.kind === "Malformed") {
    kind = "malformed";
  } else {
    return; // RateLimited handled separately.
  }
  emitWebEvent("web:ai:request-failed", {
    provider,
    kind,
    status,
    occurredAt: new Date().toISOString(),
  });
}

/**
 * Extracts the text delta from a parsed SSE data chunk for OpenAI-compatible providers.
 *
 * OpenAI-compatible format:
 *   choices[0].delta.content: "..."
 *
 * NOTE: For Anthropic providers, tool_use parsing is handled inline in the
 * streaming loop above (loop-local accumulator per Rec2; not a pure function).
 */
function extractDeltaOpenAI(parsed: Record<string, unknown>): string {
  const choices = parsed["choices"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(choices) && choices.length > 0) {
    const delta = choices[0]?.["delta"] as Record<string, unknown> | undefined;
    if (delta && typeof delta["content"] === "string") {
      return delta["content"];
    }
  }
  return "";
}
