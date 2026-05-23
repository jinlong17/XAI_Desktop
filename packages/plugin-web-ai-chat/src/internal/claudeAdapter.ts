/**
 * claudeAdapter — Option A no-op shim.
 *
 * Returns the bilingual demo line after a 600..1200 ms jittered delay. Never
 * touches window.* and never throws. Future Option B (real backend via
 * auth-device-session) replaces THIS function's body without changing its
 * signature or call sites.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md Frozen Assumption 1
 * API contract: packages/xai-web-ai-chat/docs/api.md §4
 */

import type { Lang } from "@repo/plugin-web-tokens";

export const ADAPTER_DELAY_MIN_MS = 600;
export const ADAPTER_DELAY_MAX_MS = 1200;

/** EN demo bubble — matches the artifact's network-unavailable fallback. */
export const DEMO_REPLY_EN =
  "(Demo) I'd weave your tasks, focus data, and habit streaks into a tailored plan. Network unavailable right now — try again in a moment.";

/** ZH demo bubble — matches the artifact's network-unavailable fallback. */
export const DEMO_REPLY_ZH =
  "（演示）我会综合你的任务、专注数据与习惯进度，给你一份贴近实际的建议。当前网络暂不可用，请稍后再试。";

/**
 * Returns the bilingual demo line as a Promise, resolving after a uniformly
 * jittered delay in [ADAPTER_DELAY_MIN_MS, ADAPTER_DELAY_MAX_MS] ms.
 *
 * Never rejects. The `text` parameter is reserved for future Option B and is
 * intentionally unused here.
 */
export async function completeChat(text: string, lang: Lang): Promise<string> {
  // text is reserved for future Option B (real backend).
  // Reference it once to satisfy `noUnusedParameters` cleanly without an `_` rename.
  void text;
  const span = ADAPTER_DELAY_MAX_MS - ADAPTER_DELAY_MIN_MS;
  const delay = Math.floor(ADAPTER_DELAY_MIN_MS + Math.random() * span);
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
  return lang === "zh" ? DEMO_REPLY_ZH : DEMO_REPLY_EN;
}
