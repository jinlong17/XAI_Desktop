/**
 * @repo/plugin-web-ai-chat — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * API contract: packages/xai-web-ai-chat/docs/api.md §0
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 (port map "module-ai.jsx")
 *
 * NOTE: aiChatWebModuleRegistration is added to this surface in P3
 * (shell slot registration + host wire-up phase).
 */

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Components ------------------------------------------------------------
export { AiChatModule } from "./AiChatModule.js";
export { ErrorBanner } from "./ErrorBanner.js";
export type { ErrorBannerProps } from "./ErrorBanner.js";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) -------
export { aiChatWebModuleRegistration } from "./registration.js";

// ---- Public types ----------------------------------------------------------
export type {
  AiMessage,
  AiMessageRole,
  AiAttachment,
  AiConvoRecord,
  AiModelId,
} from "./types.js";

// ---- Extension exports (gap-closure row #2 — real LLM adapter) -------------

// Streaming entrypoint (new). Returns an async iterator of token chunks.
export { streamCompleteChat } from "./internal/claudeStreamAdapter.js";
export type { StreamChunk, StreamRequest } from "./internal/claudeStreamAdapter.js";

// Typed key-storage helper namespace (consumed by Settings → AI pane).
export { aiKeyStorage } from "./internal/secretStore.js";
export type { AiKeyStorage, AiProvider } from "./internal/secretStore.js";

export {
  AI_PROVIDER_PRESETS,
  getAiProviderPreset,
  normalizeAiProviderId,
} from "./internal/providerPresets.js";
export type {
  AiModelOption,
  AiProviderId,
  AiProviderPreset,
  AiProviderTransport,
} from "./internal/providerPresets.js";

// Public error union (consumed by Settings → AI pane + ErrorBanner).
export type { LlmError, LlmErrorKind } from "./internal/llmErrors.js";
