import { useMemo, useState, type KeyboardEvent } from "react";
import { useLabelStore } from "../hooks/useLabelStore";
import type { Label } from "../types";
import { LabelBadge } from "./LabelBadge";

export interface LabelPickerProps {
  selectedIds: string[];
  onChange: (labelIds: string[]) => void;
  allowCreate?: boolean;
  placeholder?: string;
}

export function LabelPicker({
  selectedIds,
  onChange,
  allowCreate = true,
  placeholder = "Search labels",
}: LabelPickerProps) {
  const { labels, recentLabelIds, createLabel, markRecent } = useLabelStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedLabels = useMemo(
    () => selectedIds.map((id) => labels.find((label) => label.id === id)).filter((label): label is Label => Boolean(label)),
    [labels, selectedIds],
  );
  const filteredLabels = useMemo(() => {
    const lower = query.trim().toLowerCase();
    const matches = lower
      ? labels.filter((label) => label.name.toLowerCase().includes(lower) || label.icon?.toLowerCase().includes(lower))
      : labels;
    return matches.sort((a, b) => {
      const aRecent = recentLabelIds.includes(a.id) ? 0 : 1;
      const bRecent = recentLabelIds.includes(b.id) ? 0 : 1;
      return aRecent - bRecent || a.name.localeCompare(b.name);
    });
  }, [labels, query, recentLabelIds]);

  const canCreate = allowCreate && query.trim().length > 0 && !labels.some((label) => label.name.toLowerCase() === query.trim().toLowerCase());

  const toggleLabel = (label: Label) => {
    const next = selectedSet.has(label.id)
      ? selectedIds.filter((id) => id !== label.id)
      : [...selectedIds, label.id];
    markRecent([label.id]);
    onChange(next);
  };

  const handleCreate = async () => {
    const label = await createLabel({ name: query });
    markRecent([label.id]);
    onChange([...selectedIds, label.id]);
    setQuery("");
    setActiveIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filteredLabels.length + (canCreate ? 0 : -1)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Backspace" && !query && selectedIds.length > 0) {
      onChange(selectedIds.slice(0, -1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = filteredLabels[activeIndex];
      if (target) {
        toggleLabel(target);
      } else if (canCreate) {
        void handleCreate();
      }
    }
  };

  return (
    <div style={{ display: "grid", gap: 8, width: "100%" }}>
      <div
        style={{
          alignItems: "center",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          minHeight: 40,
          padding: 6,
        }}
      >
        {selectedLabels.map((label) => (
          <LabelBadge
            key={label.id}
            compact
            label={label}
            onRemove={(labelId) => onChange(selectedIds.filter((id) => id !== labelId))}
          />
        ))}
        <input
          aria-label="Search labels"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedLabels.length === 0 ? placeholder : ""}
          style={{
            border: 0,
            flex: "1 1 140px",
            font: "inherit",
            minWidth: 90,
            outline: 0,
            padding: 4,
          }}
          value={query}
        />
      </div>

      <div
        aria-label="Label options"
        role="listbox"
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          display: "grid",
          maxHeight: 220,
          overflow: "auto",
          padding: 4,
        }}
      >
        {filteredLabels.map((label, index) => (
          <button
            aria-selected={selectedSet.has(label.id)}
            key={label.id}
            onClick={() => toggleLabel(label)}
            role="option"
            style={{
              alignItems: "center",
              background: index === activeIndex ? "#f3f4f6" : "transparent",
              border: 0,
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              padding: 8,
              textAlign: "left",
            }}
            type="button"
          >
            <LabelBadge compact label={label} />
            <span aria-hidden="true">{selectedSet.has(label.id) ? "✓" : ""}</span>
          </button>
        ))}
        {canCreate ? (
          <button
            onClick={() => void handleCreate()}
            style={{
              background: activeIndex >= filteredLabels.length ? "#eef2ff" : "transparent",
              border: 0,
              borderRadius: 6,
              color: "#3730a3",
              cursor: "pointer",
              fontWeight: 700,
              padding: 8,
              textAlign: "left",
            }}
            type="button"
          >
            Create "{query.trim()}"
          </button>
        ) : null}
      </div>
    </div>
  );
}
