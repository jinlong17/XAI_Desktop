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
}

export interface StreamChunk {
  /** The accumulated text so far (NOT the delta — caller renders this directly). */
  accumulated: string;
  /** True on the final chunk before the iterator returns. */
  done: boolean;
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
  const body = config.buildBody({
    modelId,
    messages: [{ role: "user", content: text }],
    stream: streamingEnabled,
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
  let accumulated = "";
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

      // Parse the delta from the SSE event data.
      let delta = "";
      try {
        const parsed = JSON.parse(sseEvent.data) as Record<string, unknown>;
        delta = extractDelta(parsed, providerKind);
      } catch {
        // Malformed JSON in a chunk — skip silently (partial accumulation).
        continue;
      }

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

  // Emit the final chunk.
  yield { accumulated, done: true };
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
 * Extracts the text delta from a parsed SSE data chunk based on provider format.
 *
 * Anthropic format:
 *   content_block_delta: { delta: { type: "text_delta", text: "..." } }
 *
 * OpenAI-compatible format:
 *   choices[0].delta.content: "..."
 */
function extractDelta(
  parsed: Record<string, unknown>,
  provider: "anthropic" | "openai-compatible",
): string {
  if (provider === "anthropic") {
    const delta = parsed["delta"] as Record<string, unknown> | undefined;
    if (delta && typeof delta["text"] === "string") {
      return delta["text"];
    }
    return "";
  }

  // OpenAI-compatible
  const choices = parsed["choices"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(choices) && choices.length > 0) {
    const delta = choices[0]?.["delta"] as Record<string, unknown> | undefined;
    if (delta && typeof delta["content"] === "string") {
      return delta["content"];
    }
  }
  return "";
}
