import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { DesktopIcon, iconAliasMap } from "@repo/ui/icons";
import { colorTokens, radiusTokens, spaceTokens, typographyTokens } from "@repo/ui/tokens";
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
  borderRadius: radiusTokens.lg,
  background: "rgba(255,255,255,0.72)",
  border: `1px solid ${colorTokens.borderSubtle}`,
  minHeight: 72,
  padding: spaceTokens.sm,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  fontSize: typographyTokens.fontSizeLabelPx,
  color: colorTokens.textPrimary,
  cursor: "grab",
  userSelect: "none",
};

const iconSurfaceStyle: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: radiusTokens.md,
  background: "rgba(15, 23, 42, 0.08)",
  border: `1px solid ${colorTokens.borderSubtle}`,
  display: "grid",
  placeItems: "center",
  color: colorTokens.textPrimary,
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
    void finderClient
      .readFinderTags(item.filepath)
      .then((nextTags) => {
        if (!cancelled && nextTags.length > 0) {
          onUpdate?.(item.id, {
            finderTags: nextTags.map((tag) => ({
              name: tag.name,
              color: normalizeTagColor(tag.color),
            })),
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [finderClient, item.filepath, item.finderTags, item.id, onUpdate]);

  // Write path gated: write_finder_tags is a no-op in Rust and is not yet
  // registered in lib.rs. Re-enable once both the xattr implementation and
  // the command registration land. See docs/reviews/finder-tag-read-write/
  // proposed-contract-changes.md.
  const updateTags: undefined = undefined;

  const style: CSSProperties = {
    ...baseItemStyle,
    opacity: isDragging ? 0.58 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    flexDirection: variant === "list" ? "row" : "column",
    gap: variant === "list" ? spaceTokens.md : spaceTokens.xs,
    alignItems: variant === "list" ? "center" : "center",
    justifyContent: variant === "list" ? "flex-start" : "center",
  };

  const iconName = resolveIconName(item);

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={iconSurfaceStyle} aria-hidden>
        <DesktopIcon name={iconName} size={16} />
      </div>
      <div style={{ textAlign: variant === "list" ? "left" : "center", minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: typographyTokens.fontWeightSemibold,
            color: colorTokens.textPrimary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={item.filename}
        >
          {item.filename}
        </div>
        <div style={{ fontSize: 11, color: colorTokens.textSecondary }}>
          {item.type}
          {variant === "list" ? ` · ${item.filepath}` : ""}
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            justifyContent: variant === "list" ? "flex-start" : "center",
            marginTop: 4,
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCreateTask?.(item);
            }}
            style={miniButtonStyle}
          >
            Task
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setTagsOpen((open) => !open);
            }}
            style={miniButtonStyle}
          >
            Tags
          </button>
        </div>
        {tagsOpen ? (
          <div onPointerDown={(event) => event.stopPropagation()} style={{ marginTop: 6 }}>
            <TagPicker tags={tags} onChange={updateTags} readOnly />
          </div>
        ) : null}
      </div>
    </div>
  );
}

const miniButtonStyle: CSSProperties = {
  border: `1px solid ${colorTokens.borderStrong}`,
  borderRadius: 5,
  background: "rgba(255,255,255,0.88)",
  color: colorTokens.textPrimary,
  cursor: "pointer",
  fontSize: 10,
  padding: "2px 6px",
  fontFamily: typographyTokens.fontFamilySans,
};

function resolveIconName(item: DesktopItem) {
  const direct = iconAliasMap[item.icon.toLowerCase() as keyof typeof iconAliasMap];
  if (direct) {
    return direct;
  }

  switch (item.type) {
    case "folder":
      return "folder";
    case "app":
      return "grid";
    case "url":
      return "link";
    default:
      return "file";
  }
}

function normalizeTagColor(color: string | undefined): FinderTagColor | undefined {
  if (
    color === "gray" ||
    color === "green" ||
    color === "purple" ||
    color === "blue" ||
    color === "yellow" ||
    color === "red" ||
    color === "orange"
  ) {
    return color;
  }
  return undefined;
}

export default GridItem;
