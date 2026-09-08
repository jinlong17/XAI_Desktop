/**
 * models — model-picker entries for the composer popover.
 *
 * Source: web design/module-ai.jsx MODELS constant.
 */

import type { AiModelId } from "../types.js";

export interface AiModelEntry {
  readonly id: AiModelId;
  readonly name: string;
  readonly descEn: string;
  readonly descZh: string;
}

export const MODELS: readonly AiModelEntry[] = Object.freeze([
  Object.freeze({
    id: "haiku" as const,
    name: "Haiku 4.5",
    descEn: "Fast everyday model.",
    descZh: "快速日常模型。",
  }),
  Object.freeze({
    id: "sonnet" as const,
    name: "Sonnet 4.5",
    descEn: "Balanced reasoning.",
    descZh: "均衡推理。",
  }),
  Object.freeze({
    id: "opus" as const,
    name: "Opus 4.1",
    descEn: "Deepest reasoning.",
    descZh: "最深度推理。",
  }),
]);

export function findModelById(id: AiModelId): AiModelEntry {
  const entry = MODELS.find((m) => m.id === id);
  if (!entry) {
    // Unreachable under the AiModelId type constraint, but defensive for runtime
    // misuse from an `as AiModelId` cast.
    throw new Error(`[plugin-web-ai-chat] Unknown model id: ${String(id)}`);
  }
  return entry;
}
