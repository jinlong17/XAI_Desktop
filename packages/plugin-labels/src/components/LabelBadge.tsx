import type { CSSProperties } from "react";
import type { Label } from "../types";

export interface LabelBadgeProps {
  label: Label;
  compact?: boolean;
  onRemove?: (labelId: string) => void;
}

function foregroundFor(hexColor: string): string {
  const normalized = hexColor.replace("#", "");
  if (normalized.length !== 6) return "#ffffff";
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.68 ? "#111827" : "#ffffff";
}

export function LabelBadge({ label, compact = false, onRemove }: LabelBadgeProps) {
  const style: CSSProperties = {
    alignItems: "center",
    background: label.color,
    borderRadius: 6,
    color: foregroundFor(label.color),
    display: "inline-flex",
    fontSize: compact ? 11 : 12,
    fontWeight: 600,
    gap: 4,
    lineHeight: 1,
    maxWidth: "100%",
    minHeight: compact ? 20 : 24,
    padding: compact ? "4px 6px" : "5px 8px",
  };

  return (
    <span aria-label={`Label ${label.name}`} style={style}>
      {label.icon ? <span aria-hidden="true">{label.icon}</span> : null}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label.name}</span>
      {onRemove ? (
        <button
          aria-label={`Remove ${label.name}`}
          onClick={() => onRemove(label.id)}
          style={{
            alignItems: "center",
            background: "rgba(255,255,255,0.18)",
            border: 0,
            borderRadius: 4,
            color: "inherit",
            cursor: "pointer",
            display: "inline-flex",
            height: 16,
            justifyContent: "center",
            padding: 0,
            width: 16,
          }}
          type="button"
        >
          x
        </button>
      ) : null}
    </span>
  );
}
