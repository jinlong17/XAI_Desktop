/**
 * demoReply — bilingual demo reply constants.
 *
 * Extracted to a separate module to avoid a circular dependency between
 * claudeAdapter.ts and claudeStreamAdapter.ts.
 */

/** EN demo bubble — matches the artifact's network-unavailable fallback. */
export const DEMO_REPLY_EN =
  "(Demo) I'd weave your tasks, focus data, and habit streaks into a tailored plan. Network unavailable right now — try again in a moment.";

/** ZH demo bubble — matches the artifact's network-unavailable fallback. */
export const DEMO_REPLY_ZH =
  "（演示）我会综合你的任务、专注数据与习惯进度，给你一份贴近实际的建议。当前网络暂不可用，请稍后再试。";
