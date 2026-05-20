import { useState } from "react";
import type { FinderTag, FinderTagColor } from "./types";

const COLORS: FinderTagColor[] = ["gray", "green", "purple", "blue", "yellow", "red", "orange"];

export interface TagPickerProps {
  tags: FinderTag[];
  onChange?(tags: FinderTag[]): void;
  readOnly?: boolean;
}

export function TagPicker({ tags, onChange, readOnly = false }: TagPickerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<FinderTagColor>("gray");

  const add = () => {
    const nextName = name.trim();
    if (readOnly || !onChange || !nextName || tags.some((tag) => tag.name === nextName)) return;
    onChange([...tags, { name: nextName, color }]);
    setName("");
  };

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {tags.map((tag) => (
          readOnly ? (
            <span key={tag.name} style={{ ...tagStyle, background: colorMap[tag.color ?? "gray"], cursor: "default" }}>
              {tag.name}
            </span>
          ) : (
            <button
              key={tag.name}
              type="button"
              onClick={() => onChange?.(tags.filter((item) => item.name !== tag.name))}
              style={{ ...tagStyle, background: colorMap[tag.color ?? "gray"] }}
            >
              {tag.name} x
            </button>
          )
        ))}
      </div>
      {readOnly ? null : (
        <div style={{ display: "flex", gap: 4 }}>
          <input
            aria-label="Finder tag"
            value={name}
            onChange={(event) => setName(event.target.value)}
            style={{ minWidth: 80, flex: 1 }}
          />
          <select aria-label="Finder tag color" value={color} onChange={(event) => setColor(event.target.value as FinderTagColor)}>
            {COLORS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={add}>+</button>
        </div>
      )}
      {readOnly ? (
        <div style={{ color: "rgba(17,24,39,0.65)", fontSize: 11 }}>
          Finder tag write is disabled until the platform command lands.
        </div>
      ) : null}
    </div>
  );
}

const colorMap: Record<FinderTagColor, string> = {
  gray: "#6b7280",
  green: "#16a34a",
  purple: "#9333ea",
  blue: "#2563eb",
  yellow: "#ca8a04",
  red: "#dc2626",
  orange: "#ea580c",
};

const tagStyle = {
  border: 0,
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  fontSize: 11,
  padding: "3px 6px",
};
