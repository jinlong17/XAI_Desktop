/**
 * makeConvoFromUserText — pure helper producing a new AiConvoRecord from the
 * first user message of a fresh thread.
 *
 * Design: packages/xai-web-ai-chat/docs/api.md §5.2
 */

import type { Lang } from "@repo/plugin-web-tokens";
import type { AiConvoRecord } from "../types.js";

export const TITLE_MAX_LEN = 32;

export function makeConvoFromUserText(text: string, lang: Lang): AiConvoRecord {
  const now = new Date().toISOString();
  return {
    id: "c-" + Date.now().toString(36),
    title: text.slice(0, TITLE_MAX_LEN),
    time: lang === "zh" ? "刚刚" : "Just now",
    summary: text.slice(0, 140),
    updatedAt: now,
    activeAt: now,
    messages: [],
  };
}
