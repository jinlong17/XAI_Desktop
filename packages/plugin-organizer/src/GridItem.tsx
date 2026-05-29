import { CSSProperties, MouseEvent, useEffect, useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { DesktopIcon, iconAliasMap } from "@repo/ui/icons";
import { colorTokens, radiusTokens, spaceTokens, typographyTokens } from "@repo/ui/tokens";
import { DesktopItem, type FinderTagColor } from "./types";
import { useTauriInvoke } from "@repo/core/hooks";
import { createFinderClient } from "./finderClient";
import { TagPicker } from "./TagPicker";
import { getFileThumbnail, isThumbnailCandidate } from "./thumbnailCache";

type ItemVariant = "grid" | "list";
type ItemActionHealth = "authorization-required" | "path-missing" | "unknown";

interface GridItemProps {
  item: DesktopItem;
  variant?: ItemVariant;
  onUpdate?: (itemId: string, patch: Partial<DesktopItem>) => void;
  onCreateTask?: (item: DesktopItem) => void;
  onRemove?: (itemId: string) => void;
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

type ItemMenuState = { x: number; y: number } | null;

export function GridItem({ item, variant = "grid", onUpdate, onCreateTask, onRemove }: GridItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { itemId: item.id },
  });
  const { invoke } = useTauriInvoke();
  const finderClient = useMemo(() => createFinderClient(invoke), [invoke]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [itemMenu, setItemMenu] = useState<ItemMenuState>(null);
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
  const [actionHealth, setActionHealth] = useState<ItemActionHealth | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    if (!isThumbnailCandidate(item)) {
      setThumbnailSrc(null);
      return;
    }
    void getFileThumbnail(invoke, item.filepath).then((src) => {
      if (!cancelled) {
        setThumbnailSrc(src);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [invoke, item]);

  // Write path gated: write_finder_tags is a no-op in Rust and is not yet
  // registered in lib.rs. Re-enable once both the xattr implementation and
  // the command registration land. See docs/reviews/finder-tag-read-write/
  // proposed-contract-changes.md.
  const updateTags: undefined = undefined;

  const style: CSSProperties = {
    ...baseItemStyle,
    minWidth: 0,
    opacity: isDragging ? 0.58 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    flexDirection: variant === "list" ? "row" : "column",
    gap: variant === "list" ? spaceTokens.md : spaceTokens.xs,
    alignItems: variant === "list" ? "center" : "center",
    justifyContent: variant === "list" ? "flex-start" : "center",
  };

  const iconName = resolveIconName(item);

  useEffect(() => {
    if (!itemMenu) return;
    const close = () => setItemMenu(null);
    document.addEventListener("click", close);
    document.addEventListener("contextmenu", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("contextmenu", close);
    };
  }, [itemMenu]);

  const handleItemContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget.getBoundingClientRect();
    setItemMenu({
      x: event.clientX - target.left,
      y: event.clientY - target.top,
    });
  };

  const handleOpen = () => {
    if (item.type === "url" && item.url?.href) {
      window.open(item.url.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.filepath.startsWith("/")) {
      void finderClient
        .openPath(item.filepath)
        .then(() => setActionHealth(null))
        .catch((error) => {
          setActionHealth(classifyFinderActionError(error));
        });
    }
  };

  const handleReveal = () => {
    if (item.filepath.startsWith("/")) {
      void finderClient
        .revealInFinder(item.filepath)
        .then(() => setActionHealth(null))
        .catch((error) => {
          setActionHealth(classifyFinderActionError(error));
        });
    }
  };

  const menuButtonStyle: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    color: colorTokens.textOnDark,
    fontWeight: typographyTokens.fontWeightMedium,
    padding: "6px 8px",
    borderRadius: radiusTokens.sm,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: typographyTokens.fontFamilySans,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, position: "relative" }} {...listeners} {...attributes} onContextMenu={handleItemContextMenu}>
      <div style={{ ...iconSurfaceStyle, overflow: "hidden" }} aria-hidden>
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            draggable={false}
          />
        ) : (
          <DesktopIcon name={iconName} size={16} />
        )}
      </div>
      <div
        style={{
          textAlign: variant === "list" ? "left" : "center",
          minWidth: 0,
          width: variant === "grid" ? "100%" : undefined,
          flex: 1,
        }}
      >
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
        {actionHealth ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 10,
              color: actionHealth === "authorization-required" ? "#b45309" : "#b91c1c",
              fontWeight: 600,
            }}
          >
            {renderHealthCopy(actionHealth)}
          </div>
        ) : null}
      </div>
      {itemMenu ? (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: itemMenu.y,
            left: itemMenu.x,
            zIndex: 20,
            minWidth: 140,
            background: colorTokens.surfaceOverlay,
            border: `1px solid ${colorTokens.borderSubtle}`,
            borderRadius: radiusTokens.md,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            padding: 4,
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            style={menuButtonStyle}
            onClick={(event) => {
              event.stopPropagation();
              setItemMenu(null);
              handleOpen();
            }}
          >
            Open
          </button>
          <button
            type="button"
            style={menuButtonStyle}
            onClick={(event) => {
              event.stopPropagation();
              setItemMenu(null);
              handleReveal();
            }}
          >
            Reveal in Finder
          </button>
          <button
            type="button"
            style={menuButtonStyle}
            onClick={(event) => {
              event.stopPropagation();
              setItemMenu(null);
              onCreateTask?.(item);
            }}
          >
            Create Task
          </button>
          <button
            type="button"
            style={{ ...menuButtonStyle, color: "#fca5a5" }}
            onClick={(event) => {
              event.stopPropagation();
              setItemMenu(null);
              onRemove?.(item.id);
            }}
          >
            Remove from Grid
          </button>
        </div>
      ) : null}
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

function classifyFinderActionError(error: unknown): ItemActionHealth {
  const message = String(error ?? "").toLowerCase();
  if (
    message.includes("e3004") &&
    (message.includes("bookmark") || message.includes("authorized"))
  ) {
    return "authorization-required";
  }
  if (message.includes("e3005") || message.includes("path")) {
    return "path-missing";
  }
  return "unknown";
}

function renderHealthCopy(status: ItemActionHealth): string {
  switch (status) {
    case "authorization-required":
      return "Re-authorization needed: drag this path again to restore Finder access.";
    case "path-missing":
      return "Path unavailable: verify the file still exists or remove this item.";
    default:
      return "Action failed. Retry after checking this item's path access.";
  }
}

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
