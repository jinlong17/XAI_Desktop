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
