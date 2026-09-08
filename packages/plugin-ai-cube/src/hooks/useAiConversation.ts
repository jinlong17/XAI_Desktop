import { useEffect, useState } from "react";
import { useAiCubeRepoAdapters } from "../data/RepoProvider";
import type { ActionSuggestion, AiMessage, PrivacyReview } from "../types";
import { redactSecrets } from "../redaction";
import { useCostGuard } from "./useCostGuard";

export interface AiConversationState {
  messages: AiMessage[];
  input: string;
  suggestions: ActionSuggestion[];
  pendingReview: PrivacyReview | undefined;
  costGuard: ReturnType<typeof useCostGuard>;
  setInput(input: string): void;
  requestSend(): void;
  approveAndSend(): Promise<void>;
  cancelReview(): void;
  runSuggestion(kind: ActionSuggestion["kind"]): void;
}

// TODO(events): replace with @repo/core/events typed bus when wired.
function emitMockAction(kind: ActionSuggestion["kind"]): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ai-cube:mock-action", { detail: { kind } }));
}

export function useAiConversation(): AiConversationState {
  const repoAdapters = useAiCubeRepoAdapters();
  const [messages, setMessages] = useState<AiMessage[]>([makeMessage("system", "AI Cube is running in local mock mode.")]);
  const [input, setInput] = useState("");
  const [pendingReview, setPendingReview] = useState<PrivacyReview>();
  const costGuard = useCostGuard();
  const suggestions = createSuggestions();

  useEffect(() => {
    if (!repoAdapters) return;
    let cancelled = false;
    void repoAdapters.messageAdapter.getAll().then((stored) => {
      if (!cancelled && stored.length > 0) {
        setMessages(stored.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [repoAdapters]);

  function appendMessages(nextMessages: AiMessage[]): void {
    setMessages((current) => [...current, ...nextMessages]);
    nextMessages.forEach((message) => {
      void repoAdapters?.messageAdapter.save(message);
    });
  }

  return {
    messages,
    input,
    suggestions,
    pendingReview,
    costGuard,
    setInput,
    requestSend() {
      if (input.trim().length === 0) return;
      const review = buildPrivacyReview(input);
      setPendingReview(review);
    },
    async approveAndSend() {
      const redacted = redactSecrets(input);
      const userMessage = makeMessage("user", redacted.text, redacted.findings.length > 0);
      const assistantMessage = makeMessage("assistant", await mockResponse(redacted.text, costGuard.canSend));
      if (costGuard.canSend) {
        costGuard.recordCall();
      }
      appendMessages([userMessage, assistantMessage]);
      setInput("");
      setPendingReview(undefined);
    },
    cancelReview() {
      setPendingReview(undefined);
    },
    runSuggestion(kind) {
      const suggestion = suggestions.find((item) => item.kind === kind);
      appendMessages([makeMessage("assistant", `Mock action queued: ${suggestion?.label ?? kind}.`)]);
      emitMockAction(kind);
    },
  };
}

function buildPrivacyReview(input: string): PrivacyReview {
  const redacted = redactSecrets(input);
  return {
    dataTypes: ["message text", "selected mock context"],
    scope: "Pattern coverage: JWT, OpenAI, GitHub PAT, AWS, Stripe, Slack, SSH key block, Bearer, email, macOS home path, credit-card (Luhn). Mock only — no real API call is made.",
    secretsDetected: redacted.findings,
    approved: false,
  };
}

function createSuggestions(): ActionSuggestion[] {
  return [
    { id: "todo", kind: "create-todo", label: "Create Todo", description: "Draft a task from this conversation." },
    { id: "desktop", kind: "organize-desktop", label: "Organize Desktop", description: "Suggest a mock file cleanup plan." },
    { id: "clipboard", kind: "summarize-clipboard", label: "Summarize Clipboard", description: "Summarize mock clipboard text." },
  ];
}

async function mockResponse(input: string, online: boolean): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (!online) {
    return "Offline fallback: I saved a local note and will retry when AI is available.";
  }
  return `Mock response: I found a next step from "${input.slice(0, 80)}".`;
}

function makeMessage(role: AiMessage["role"], content: string, redacted = false): AiMessage {
  const timestamp = new Date().toISOString();
  return {
    id: `ai-message-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    entityType: "aicube.message",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "device-local",
    role,
    content,
    redacted,
    version: 1,
  };
}
