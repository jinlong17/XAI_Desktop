import { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { DesktopItem } from "./types";

type ItemVariant = "grid" | "list";

interface GridItemProps {
  item: DesktopItem;
  variant?: ItemVariant;
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

export function GridItem({ item, variant = "grid" }: GridItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { itemId: item.id },
  });

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
      </div>
    </div>
  );
}

export default GridItem;
