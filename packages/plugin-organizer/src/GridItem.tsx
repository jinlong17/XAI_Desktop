import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { DesktopItem, type FinderTagColor } from "./types";
import { useTauriInvoke } from "@repo/core/hooks";
import { createFinderClient } from "./finderClient";
import { TagPicker } from "./TagPicker";

type ItemVariant = "grid" | "list";

interface GridItemProps {
  item: DesktopItem;
  variant?: ItemVariant;
  onUpdate?: (itemId: string, patch: Partial<DesktopItem>) => void;
  onCreateTask?: (item: DesktopItem) => void;
}

const baseItemStyle: CSSProperties = {
  borderRadius: 12,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(0,0,0,0.05)",
  minHeight: 72,
  padding: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  fontSize: 12,
  color: "#0b1220",
  cursor: "grab",
  userSelect: "none",
};

export function GridItem({ item, variant = "grid", onUpdate, onCreateTask }: GridItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { itemId: item.id },
  });
  const { invoke } = useTauriInvoke();
  const finderClient = useMemo(() => createFinderClient(invoke), [invoke]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const tags = item.finderTags ?? [];

  useEffect(() => {
    if (!item.filepath || item.finderTags) return;
    let cancelled = false;
    void finderClient.readFinderTags(item.filepath).then((nextTags) => {
      if (!cancelled && nextTags.length > 0) {
        onUpdate?.(item.id, { finderTags: nextTags.map((tag) => ({ name: tag.name, color: normalizeTagColor(tag.color) })) });
      }
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [finderClient, item.filepath, item.finderTags, item.id, onUpdate]);

  const updateTags = (nextTags: DesktopItem["finderTags"]) => {
    onUpdate?.(item.id, { finderTags: nextTags });
    if (item.filepath) {
      void finderClient.writeFinderTags(item.filepath, nextTags ?? []).catch(() => undefined);
    }
  };

  const style: CSSProperties = {
    ...baseItemStyle,
    opacity: isDragging ? 0.5 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    flexDirection: variant === "list" ? "row" : "column",
    gap: variant === "list" ? 10 : 4,
    alignItems: variant === "list" ? "center" : "center",
    justifyContent: variant === "list" ? "flex-start" : "center",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "linear-gradient(135deg, #8b5cf6, #38bdf8)",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 12,
        }}
        aria-hidden
      >
        {item.filename.substring(0, 2).toUpperCase()}
      </div>
      <div style={{ textAlign: variant === "list" ? "left" : "center" }}>
        <div style={{ fontWeight: 600 }}>{item.filename}</div>
        <div style={{ fontSize: 11, opacity: 0.75 }}>
          {item.type}
          {variant === "list" ? ` · ${item.filepath}` : ""}
        </div>
        <div style={{ display: "flex", gap: 4, justifyContent: variant === "list" ? "flex-start" : "center", marginTop: 4 }}>
          <button type="button" onClick={(event) => { event.stopPropagation(); onCreateTask?.(item); }} style={miniButtonStyle}>
            Task
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setTagsOpen((open) => !open); }} style={miniButtonStyle}>
            Tags
          </button>
        </div>
        {tagsOpen ? (
          <div onPointerDown={(event) => event.stopPropagation()} style={{ marginTop: 6 }}>
            <TagPicker tags={tags} onChange={updateTags} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

const miniButtonStyle: CSSProperties = {
  border: "1px solid rgba(17,24,39,0.18)",
  borderRadius: 5,
  background: "rgba(255,255,255,0.75)",
  color: "#111827",
  cursor: "pointer",
  fontSize: 10,
  padding: "2px 4px",
};

function normalizeTagColor(color: string | undefined): FinderTagColor | undefined {
  if (color === "gray" || color === "green" || color === "purple" || color === "blue" || color === "yellow" || color === "red" || color === "orange") {
    return color;
  }
  return undefined;
}

export default GridItem;
