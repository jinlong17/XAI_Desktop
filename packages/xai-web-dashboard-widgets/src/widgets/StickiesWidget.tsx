/**
 * StickiesWidget — sticky note stack with create + delete.
 *
 * Ported from `web design/module-dashboard.jsx` lines 431-449 (baseline).
 * Extended by xai-web-dashboard-stickies-create (SP3) to wire useStickies +
 * StickyComposer + per-sticky delete + fixture-as-sample disposition.
 *
 * Disposition (G1 decision):
 *   - Empty store (list.length === 0): render 3 read-only STICKIES fixture
 *     samples + empty hint. Samples carry data-sample="true" and NO .sticky-del.
 *   - Non-empty store: render user stickies only (no fixtures). Each sticky
 *     has a per-sticky × delete button (.sticky-del).
 *
 * IMPORTANT render split (RS4 / OQ6):
 *   - Fixture path: `n.text[lang]` (bilingual), `n.color` (raw hex literal).
 *     MUST NOT route fixture hex through STICKY_COLORS (would key-miss).
 *   - User path: `s.text` (single string), `STICKY_COLORS[s.color]` (token→hex).
 *
 * StickiesWidget is a stable React component — hooks survive grid re-renders
 * (exactly like ClockWidget). No state lifts outside the widget.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §E
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §E
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { STICKIES } from "../internal/fixtures.js";
import { fallbackStickyPosition } from "../internal/stickiesStore/stickiesStore.js";
import { useStickies } from "../internal/stickiesStore/useStickies.js";
import type { StickyPosition, StickySize, UserSticky } from "../internal/stickiesStore/types.js";
import { STICKY_COLORS, STICKY_DEFAULT_SIZE, STICKY_SIZE_LIMITS } from "../internal/stickiesStore/types.js";
import { StickyComposer } from "../StickyComposer.js";
import { str } from "../internal/strings.js";

export interface StickiesWidgetProps {
  lang: Lang;
}

function formatStickyCreatedAt(value: string, lang: Lang): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function clampStickyDimension(value: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function getStickySize(note: Pick<UserSticky, "width" | "height">): StickySize {
  return {
    width: clampStickyDimension(
      note.width,
      STICKY_SIZE_LIMITS.minWidth,
      STICKY_SIZE_LIMITS.maxWidth,
      STICKY_DEFAULT_SIZE.width,
    ),
    height: clampStickyDimension(
      note.height,
      STICKY_SIZE_LIMITS.minHeight,
      STICKY_SIZE_LIMITS.maxHeight,
      STICKY_DEFAULT_SIZE.height,
    ),
  };
}

interface ResizeSession {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  width: number;
  height: number;
}

interface DragSession {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  x: number;
  y: number;
  active: boolean;
}

function isInteractiveStickyTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest("button, input, textarea, select, a") !== null;
}

function clampCanvasCoordinate(value: number, size: number, canvasSize: number): number {
  const max = Math.max(0, canvasSize - size);
  return Math.min(max, Math.max(0, Math.round(value)));
}

function getStickyPosition(note: Pick<UserSticky, "x" | "y">, index: number, size: StickySize): StickyPosition {
  const fallback = fallbackStickyPosition(index, size);
  return {
    x: clampStickyDimension(note.x, 0, Number.MAX_SAFE_INTEGER, fallback.x),
    y: clampStickyDimension(note.y, 0, Number.MAX_SAFE_INTEGER, fallback.y),
  };
}

export function StickiesWidget({ lang }: StickiesWidgetProps) {
  const { s } = useI18n(lang);
  const { list, create, remove, update, resize, move } = useStickies();
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingSticky, setEditingSticky] = useState<UserSticky | null>(null);
  const [resizePreview, setResizePreview] = useState<Record<string, StickySize>>({});
  const [positionPreview, setPositionPreview] = useState<Record<string, StickyPosition>>({});
  const [draggingStickyId, setDraggingStickyId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const resizeSessionRef = useRef<ResizeSession | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);

  const hasUserStickies = list.length > 0;
  const openCreateComposer = () => {
    setEditingSticky(null);
    setComposerOpen(true);
  };
  const openEditComposer = (note: UserSticky) => {
    setEditingSticky(note);
    setComposerOpen(true);
  };
  const startStickyResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>, note: UserSticky) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const size = getStickySize(note);
    resizeSessionRef.current = {
      id: note.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: size.width,
      startHeight: size.height,
      width: size.width,
      height: size.height,
    };
    setResizePreview((prev) => ({ ...prev, [note.id]: size }));
  }, []);

  const startStickyDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, note: UserSticky, index: number) => {
      if (event.button !== 0) return;
      if (isInteractiveStickyTarget(event.target)) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const size = resizePreview[note.id] ?? getStickySize(note);
      const position = positionPreview[note.id] ?? getStickyPosition(note, index, size);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      dragSessionRef.current = {
        id: note.id,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startLeft: position.x,
        startTop: position.y,
        width: size.width,
        height: size.height,
        canvasWidth: canvasRect.width,
        canvasHeight: canvasRect.height,
        x: position.x,
        y: position.y,
        active: false,
      };
    },
    [positionPreview, resizePreview],
  );

  useEffect(() => {
    const clearPreview = (id: string) => {
      setResizePreview((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      const session = resizeSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      event.preventDefault();
      const width = clampStickyDimension(
        session.startWidth + event.clientX - session.startX,
        STICKY_SIZE_LIMITS.minWidth,
        STICKY_SIZE_LIMITS.maxWidth,
        STICKY_DEFAULT_SIZE.width,
      );
      const height = clampStickyDimension(
        session.startHeight + event.clientY - session.startY,
        STICKY_SIZE_LIMITS.minHeight,
        STICKY_SIZE_LIMITS.maxHeight,
        STICKY_DEFAULT_SIZE.height,
      );
      session.width = width;
      session.height = height;
      setResizePreview((prev) => {
        const current = prev[session.id];
        if (current?.width === width && current.height === height) return prev;
        return { ...prev, [session.id]: { width, height } };
      });
    };

    const onPointerUp = (event: PointerEvent) => {
      const session = resizeSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      resizeSessionRef.current = null;
      resize(session.id, { width: session.width, height: session.height });
      clearPreview(session.id);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [resize]);

  useEffect(() => {
    const clearDrag = () => {
      const session = dragSessionRef.current;
      dragSessionRef.current = null;
      setDraggingStickyId(null);
      setPositionPreview((prev) => {
        if (!session || !(session.id in prev)) return prev;
        const next = { ...prev };
        delete next[session.id];
        return next;
      });
      return session;
    };

    const onPointerMove = (event: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      const distance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);
      if (!session.active && distance < 6) return;
      if (!session.active) {
        session.active = true;
        setDraggingStickyId(session.id);
      }
      event.preventDefault();
      const x = clampCanvasCoordinate(
        session.startLeft + event.clientX - session.startX,
        session.width,
        session.canvasWidth,
      );
      const y = clampCanvasCoordinate(
        session.startTop + event.clientY - session.startY,
        session.height,
        session.canvasHeight,
      );
      session.x = x;
      session.y = y;
      setPositionPreview((prev) => {
        const current = prev[session.id];
        if (current?.x === x && current.y === y) return prev;
        return { ...prev, [session.id]: { x, y } };
      });
    };

    const onPointerUp = (event: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      const completed = clearDrag();
      if (completed?.active) move(completed.id, { x: completed.x, y: completed.y });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [move]);

  return (
    <div className="widget-content w-stickies-body">
      <div className="wgt-h">
        <Icon name="note" size={14} />
        <span>{s("dashboard.sticky_notes")}</span>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          data-no-drag
          aria-label={str("aria_add", lang)}
          onClick={openCreateComposer}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>

      <div className="sticky-stack" ref={canvasRef}>
        {hasUserStickies ? (
          /* User sticky path: single-string text + preset color token */
          list.map((note, i) => {
            const size = resizePreview[note.id] ?? getStickySize(note);
            const position = positionPreview[note.id] ?? getStickyPosition(note, i, size);
            const style = {
              background: STICKY_COLORS[note.color],
              transform: `rotate(${(i - 1) * 2}deg)`,
              position: "absolute",
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
              zIndex: draggingStickyId === note.id ? 30 : (note.order ?? i) + 1,
            } satisfies CSSProperties;
            const isResizing = resizeSessionRef.current?.id === note.id;
            const isDragging = draggingStickyId === note.id;
            return (
              <div
                key={note.id}
                className={`sticky${isResizing ? " is-resizing" : ""}${isDragging ? " is-dragging" : ""}`}
                style={style}
                tabIndex={0}
                role="button"
                data-no-drag
                data-sticky-id={note.id}
                aria-label={`${str("aria_edit_move", lang)}: ${note.text}`}
                title={str("aria_edit_move", lang)}
                onPointerDown={(event) => startStickyDrag(event, note, i)}
                onDoubleClick={() => openEditComposer(note)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter") openEditComposer(note);
                }}
              >
                <div className="sticky-text">{note.text}</div>
                {note.source && (
                  <div className="sticky-meta">
                    {note.source.listLabel && <span>{note.source.listLabel}</span>}
                    {note.source.tagLabel && <span>{note.source.tagLabel}</span>}
                    {note.source.dateLabel && <span>{note.source.dateLabel}</span>}
                    {note.source.completed && <span>{str("meta_done", lang)}</span>}
                  </div>
                )}
                <time className="sticky-time" dateTime={note.createdAt}>
                  {formatStickyCreatedAt(note.createdAt, lang)}
                </time>
                <button
                  type="button"
                  className="sticky-del"
                  data-no-drag
                  aria-label={`${str("aria_delete", lang)}: ${note.text}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(note.id);
                    if (editingSticky?.id === note.id) {
                      setEditingSticky(null);
                      setComposerOpen(false);
                    }
                  }}
                >
                  ×
                </button>
                <button
                  type="button"
                  className="sticky-resize"
                  data-no-drag
                  aria-label={`${str("aria_resize", lang)}: ${note.text}`}
                  title={str("aria_resize", lang)}
                  onPointerDown={(event) => startStickyResize(event, note)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M5 12h7V5M8 12l4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })
        ) : (
          /* Empty-store path: fixture samples (read-only, bilingual) + hint */
          <>
            {STICKIES.map((n, i) => (
              <div
                key={n.id}
                className="sticky sticky--sample"
                data-sample="true"
                style={{
                  background: n.color,        // raw hex literal — NOT STICKY_COLORS
                  transform: `rotate(${(i - 1) * 2}deg)`,
                }}
                aria-label={str("aria_sample", lang)}
              >
                {n.text[lang]}
              </div>
            ))}
            <button
              type="button"
              className="sticky-empty-action"
              data-no-drag
              onClick={openCreateComposer}
            >
              {str("hint_empty", lang)}
            </button>
          </>
        )}
      </div>

      <StickyComposer
        open={composerOpen}
        lang={lang}
        initial={editingSticky}
        onSave={(draft) => {
          if (editingSticky) update(editingSticky.id, draft);
          else create(draft);
          setEditingSticky(null);
          setComposerOpen(false);
        }}
        onClose={() => {
          setEditingSticky(null);
          setComposerOpen(false);
        }}
      />
    </div>
  );
}
