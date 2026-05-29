/**
 * claudeAdapter — completeChat entry point.
 *
 * Delegates to streamCompleteChat and accumulates the final assistant text.
 * Policy failures and provider failures are re-thrown as LlmError so callers
 * stay fail-closed.
 */

import type { Lang } from "@repo/plugin-web-tokens";
import { getPref } from "@repo/plugin-web-storage";
import { streamCompleteChat } from "./claudeStreamAdapter.js";
import { DEMO_REPLY_EN as _DEMO_EN, DEMO_REPLY_ZH as _DEMO_ZH } from "./demoReply.js";
import type { LlmError } from "./llmErrors.js";

// Kept as exported test fixtures for existing integration tests.
export const ADAPTER_DELAY_MIN_MS = 600;
export const ADAPTER_DELAY_MAX_MS = 1200;
export const DEMO_REPLY_EN = _DEMO_EN;
export const DEMO_REPLY_ZH = _DEMO_ZH;

export async function completeChat(text: string, lang: Lang): Promise<string> {
  let accumulated = "";
  let sawChunk = false;
  for await (const chunk of streamCompleteChat({
    text,
    lang,
    model: (getPref("xai_ai_model_default") as "haiku" | "sonnet" | "opus") ?? "haiku",
  })) {
    sawChunk = true;
    accumulated = chunk.accumulated;
    if (chunk.done) break;
  }

  if (!sawChunk || !accumulated.trim()) {
    throw {
      kind: "Malformed",
      where: "shape",
      detail: "empty accumulated assistant response",
    } satisfies LlmError;
  }

  return accumulated;
}
