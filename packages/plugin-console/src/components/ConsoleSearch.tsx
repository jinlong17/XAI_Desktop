import { useMemo, useState } from "react";
import type { SearchableEntity } from "../types";

export interface ConsoleSearchProps {
  entities?: SearchableEntity[];
  onOpen?: (entity: SearchableEntity) => void;
}

export function ConsoleSearch({ entities = [], onOpen }: ConsoleSearchProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const lower = query.toLowerCase();
    if (!lower) return entities.slice(0, 6);
    return entities
      .filter((entity) => [entity.title, entity.subtitle, ...(entity.keywords ?? [])].join(" ").toLowerCase().includes(lower))
      .slice(0, 8);
  }, [entities, query]);

  return (
    <div style={{ display: "grid", gap: 8, minWidth: 220 }}>
      <input
        aria-label="Console search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
        style={{ border: "1px solid #d1d5db", borderRadius: 8, minHeight: 36, padding: "0 10px" }}
        value={query}
      />
      {query ? (
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, display: "grid", gap: 4, padding: 4 }}>
          {results.map((entity) => (
            <button
              key={`${entity.type}:${entity.id}`}
              onClick={() => onOpen?.(entity)}
              style={{ background: "transparent", border: 0, borderRadius: 6, cursor: "pointer", padding: 8, textAlign: "left" }}
              type="button"
            >
              <strong>{entity.title}</strong>
              <span style={{ color: "#6b7280", display: "block", fontSize: 12 }}>{entity.type}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
