/**
 * claudeAdapter — completeChat entry point.
 *
 * If no API key is configured → returns the bilingual demo line after a
 * 600..1200 ms jittered delay (Option A behaviour, preserved for first-load UX).
 *
 * If an API key IS configured → delegates to streamCompleteChat and accumulates
 * the full response. Re-throws LlmError if the request fails (the FIFO queue
 * processor in AiChatModule catches it).
 *
 * The external signature `completeChat(text, lang): Promise<string>` is
 * UNCHANGED per HC7 and design.md FA-1.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md FA-1 (2026-05-25 Extension)
 * API contract: packages/xai-web-ai-chat/docs/api.md §4 + §12 preamble
 */

import type { Lang } from "@repo/plugin-web-tokens";
import { getPref } from "@repo/plugin-web-storage";
import { aiKeyStorage } from "./secretStore.js";
import { streamCompleteChat } from "./claudeStreamAdapter.js";
import { DEMO_REPLY_EN as _DEMO_EN, DEMO_REPLY_ZH as _DEMO_ZH } from "./demoReply.js";
import { getAiProviderPreset } from "./providerPresets.js";

export const ADAPTER_DELAY_MIN_MS = 600;
export const ADAPTER_DELAY_MAX_MS = 1200;

/** EN demo bubble — matches the artifact's network-unavailable fallback. */
export const DEMO_REPLY_EN = _DEMO_EN;

/** ZH demo bubble — matches the artifact's network-unavailable fallback. */
export const DEMO_REPLY_ZH = _DEMO_ZH;

/**
 * Returns the response string for a user prompt.
 *
 * - No key configured → demo line after jitter delay.
 * - Key configured → real LLM response via streamCompleteChat (accumulated).
 *
 * @throws LlmError if the real adapter call fails (propagated to caller).
 */
export async function completeChat(text: string, lang: Lang): Promise<string> {
  // Check whether a real API key is configured.
  const provider = (getPref("xai_ai_provider") as string) || "anthropic";
  const providerPreset = getAiProviderPreset(provider);
  const apiKey = await aiKeyStorage.loadKey(providerPreset.id);

  if (!apiKey) {
    // No key configured — preserve Option A demo behaviour.
    void text; // reserved for future Option B
    const span = ADAPTER_DELAY_MAX_MS - ADAPTER_DELAY_MIN_MS;
    const delay = Math.floor(ADAPTER_DELAY_MIN_MS + Math.random() * span);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, delay);
    });
    return lang === "zh" ? DEMO_REPLY_ZH : DEMO_REPLY_EN;
  }

  // Key configured — call the real streaming adapter and accumulate.
  let accumulated = "";
  for await (const chunk of streamCompleteChat({
    text,
    lang,
    model: (getPref("xai_ai_model_default") as string) || providerPreset.defaultModel,
  })) {
    accumulated = chunk.accumulated;
    if (chunk.done) break;
  }
  return accumulated || (lang === "zh" ? DEMO_REPLY_ZH : DEMO_REPLY_EN);
}
