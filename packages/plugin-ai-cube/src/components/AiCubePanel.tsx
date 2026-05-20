import { useAiConversation } from "../hooks/useAiConversation";
import { ActionSuggestionButton } from "./ActionSuggestion";
import { CostGuard } from "./CostGuard";
import { InputBar } from "./InputBar";
import { MessageBubble } from "./MessageBubble";
import { OfflineFallback } from "./OfflineFallback";
import { PrivacyGateDialog } from "./PrivacyGateDialog";

export function AiCubePanel() {
  const conversation = useAiConversation();
  return (
    <section style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 12, minHeight: 520 }}>
      <CostGuard guard={conversation.costGuard} />
      <OfflineFallback active={!conversation.costGuard.canSend} />
      <div style={{ display: "grid", alignContent: "start", gap: 10, overflow: "auto" }}>
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {conversation.suggestions.map((suggestion) => (
            <ActionSuggestionButton key={suggestion.id} suggestion={suggestion} onRun={conversation.runSuggestion} />
          ))}
        </div>
        <InputBar value={conversation.input} onChange={conversation.setInput} onSend={conversation.requestSend} />
      </div>
      <PrivacyGateDialog review={conversation.pendingReview} onApprove={() => void conversation.approveAndSend()} onCancel={conversation.cancelReview} />
    </section>
  );
}
