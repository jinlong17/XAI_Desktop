// All exported hooks/components in this package are client-only. Consumers must wrap with "use client" in Next.js.

export type { ActionSuggestion, AiActionKind, AiMessage, AiRole, CostGuardState, PrivacyReview } from "./types";
export type { CostGuardApi } from "./hooks/useCostGuard";
export { redactSecrets } from "./redaction";
export { useAiConversation } from "./hooks/useAiConversation";
export { useCostGuard } from "./hooks/useCostGuard";
export { AiCubePanel } from "./components/AiCubePanel";
export { ActionSuggestionButton } from "./components/ActionSuggestion";
export { CostGuard } from "./components/CostGuard";
export { InputBar } from "./components/InputBar";
export { MessageBubble } from "./components/MessageBubble";
export { OfflineFallback } from "./components/OfflineFallback";
export { PrivacyGateDialog } from "./components/PrivacyGateDialog";
