import type { CommandSearchResult, SearchResultAction } from "../types";

export interface SearchResultProps {
  result: CommandSearchResult;
  active?: boolean;
  onExecute: (result: CommandSearchResult, action: SearchResultAction) => void;
}

export function SearchResult({ result, active = false, onExecute }: SearchResultProps) {
  return (
    <div
      role="option"
      aria-selected={active}
      style={{
        background: active ? "#eef2ff" : "#ffffff",
        borderRadius: 8,
        display: "grid",
        gap: 6,
        padding: 10,
      }}
    >
      <button
        onClick={() => onExecute(result, result.actions[0] ?? "open")}
        style={{
          background: "transparent",
          border: 0,
          cursor: "pointer",
          font: "inherit",
          padding: 0,
          textAlign: "left",
        }}
        type="button"
      >
        <strong>{result.entity.title}</strong>
        <span style={{ color: "#6b7280", display: "block", fontSize: 12 }}>
          {result.entity.type}
          {result.entity.subtitle ? ` · ${result.entity.subtitle}` : ""}
        </span>
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {result.actions.map((action) => (
          <button
            key={action}
            onClick={() => onExecute(result, action)}
            style={{ border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", padding: "4px 6px" }}
            type="button"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
