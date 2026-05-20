import type { ActionSuggestion as Suggestion } from "../types";

export function ActionSuggestionButton({ suggestion, onRun }: { suggestion: Suggestion; onRun(kind: Suggestion["kind"]): void }) {
  return (
    <button type="button" onClick={() => onRun(suggestion.kind)} style={{ textAlign: "left", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: "#ffffff" }}>
      <strong>{suggestion.label}</strong>
      <small style={{ display: "block", color: "#64748b" }}>{suggestion.description}</small>
    </button>
  );
}
