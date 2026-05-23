/**
 * TimelineView — 30-day Gantt with 3-handle pointer DnD.
 *
 * Hard constraints (per api.md §6 + design.md §frozen-assumption #8):
 * - Three handles: left (resize-l), center (move), right (resize-r).
 * - mouseup commits ONE atomic updateCard({due, start, dueEn, dueLate}).
 * - mouseup-without-mousemove → NO write.
 * - Bars clamp to [0, days-1] via clampDay; CSS clip-path at edges.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §6
 *
 * REC-1 note: local state for pointer drag captures is intentional v1; the
 * exit strategy (board-core re-export or row #9 wrap) is documented in
 * design.md §1 / R11.
 */

import { useEffect, useRef, useState } from "react";
import type { BoardListData, BoardCardData } from "@repo/plugin-web-board-core";
import type { Lang } from "./internal/i18n.js";
import { parseDay, dayToStr, clampDay } from "./internal/dateOps.js";

export interface TimelineViewProps {
  lists: readonly BoardListData[];
  lang: Lang;
  updateCard: (listId: string, cardId: string, patch: Partial<BoardCardData>) => void;
  onOpenCard?: (card: BoardCardData, listId: string) => void;
}

const DAYS = 30;

type DragMode = "resize-l" | "resize-r" | "move";
type DragState = {
  cardId: string;
  listId: string;
  mode: DragMode;
  initStart: number;
  initEnd: number;
  startX: number;
};
type PreviewMap = Record<string, { start: number; end: number }>;

export function TimelineView({
  lists,
  lang,
  updateCard,
  onOpenCard,
}: TimelineViewProps) {
  const today = new Date();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [preview, setPreview] = useState<PreviewMap>({});

  // Build day header labels
  const dayLabels = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return { day: d.getDate(), month: d.getMonth() + 1, isToday: i === 0 };
  });

  // Parse each card's (start, end) offsets
  const itemsByList = lists.map((list) => {
    const items = list.cards
      .map((card) => {
        const endOff = parseDay(card.due, today);
        if (endOff === null) return null;
        const startOff =
          card.start !== undefined && card.start !== null
            ? (parseDay(card.start, today) ?? endOff)
            : endOff;
        const p = preview[card.id];
        const start = p !== undefined ? p.start : startOff;
        const end = p !== undefined ? p.end : endOff;
        return { card, start, end, list };
      })
      .filter(
        (x): x is { card: BoardCardData; start: number; end: number; list: BoardListData } =>
          x !== null && x.end >= 0 && x.start < DAYS,
      );
    return { list, items };
  });

  // Pointer event handlers
  const onHandleDown = (
    e: React.PointerEvent<HTMLDivElement>,
    mode: DragMode,
    card: BoardCardData,
    list: BoardListData,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const startOff =
      card.start !== undefined && card.start !== null
        ? (parseDay(card.start, today) ?? parseDay(card.due, today) ?? 0)
        : (parseDay(card.due, today) ?? 0);
    const endOff = parseDay(card.due, today);
    if (endOff === null) return;
    setDrag({
      cardId: card.id,
      listId: list.id,
      mode,
      initStart: startOff,
      initEnd: endOff,
      startX: e.clientX,
    });
  };

  useEffect(() => {
    if (!drag) return;
    const trackEl = trackRef.current;
    if (!trackEl) return;

    const onMove = (e: PointerEvent) => {
      const rect = trackEl.getBoundingClientRect();
      const dayWidth = rect.width / DAYS;
      if (dayWidth <= 0) return;

      const dx = e.clientX - drag.startX;
      const deltaDays = Math.round(dx / dayWidth);
      let s = drag.initStart;
      let en = drag.initEnd;

      if (drag.mode === "resize-l") {
        s = Math.min(drag.initEnd, drag.initStart + deltaDays);
      } else if (drag.mode === "resize-r") {
        en = Math.max(drag.initStart, drag.initEnd + deltaDays);
      } else {
        // move
        s = drag.initStart + deltaDays;
        en = drag.initEnd + deltaDays;
      }

      s = clampDay(s);
      en = clampDay(en);

      setPreview((p) => ({ ...p, [drag.cardId]: { start: s, end: en } }));
    };

    const onUp = () => {
      const p = preview[drag.cardId];
      if (!p) {
        // mouseup-without-mousemove: NO write (hard constraint TL12/TL16)
        setDrag(null);
        return;
      }
      const final = p;
      // Hard constraint: ONE atomic write with {due, start, dueEn, dueLate}
      const patch: Partial<BoardCardData> = {
        due: dayToStr(final.end, today),
        start: final.start === final.end ? undefined : dayToStr(final.start, today),
        dueEn: undefined,
        dueLate: false,
      };
      updateCard(drag.listId, drag.cardId, patch);
      setPreview((prev) => {
        const next = { ...prev };
        delete next[drag.cardId];
        return next;
      });
      setDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // preview needs to be in deps so onUp reads the latest preview state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag, preview]);

  return (
    <div className="board-timeline panel" data-testid="board-timeline">
      <div className="bt-grid">
        {/* Corner */}
        <div className="bt-corner" />

        {/* Day headers */}
        <div className="bt-days" data-testid="tl-days">
          {dayLabels.map((d, i) => (
            <div
              key={i}
              className={"bt-day" + (d.isToday ? " today" : "")}
              data-testid={d.isToday ? "tl-day-today" : "tl-day"}
            >
              <div className="bt-day-num">{d.day}</div>
              <div className="bt-day-m">
                {d.month}/{d.day}
              </div>
            </div>
          ))}
        </div>

        {/* List rows */}
        {itemsByList.map(({ list, items }) => {
          const color = list.color
            ? `var(--board-list-color-${list.color})`
            : "var(--accent)";
          const name = list.key ?? (list.customName?.[lang] ?? "");

          return (
            <>
              <div key={`name-${list.id}`} className="bt-list-name" data-testid="tl-list-name">
                <span className="dot" style={{ color }} aria-hidden="true" />
                {" "}
                {name}
              </div>
              <div
                key={`track-${list.id}`}
                className="bt-track"
                ref={items.length ? trackRef : null}
                data-testid="tl-track"
              >
                {items.map(({ card, start, end }) => {
                  const widthPct = ((end - start + 1) / DAYS) * 100;
                  const leftPct = (start / DAYS) * 100;
                  const isDragging = drag?.cardId === card.id;

                  return (
                    <div
                      key={card.id}
                      className={"bt-bar" + (isDragging ? " dragging" : "")}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        background: `color-mix(in oklch, ${color} 18%, transparent)`,
                        borderColor: color,
                        color,
                      }}
                      data-testid="tl-bar"
                    >
                      {/* Left handle — resize-l */}
                      <div
                        className="bt-handle bt-handle-l"
                        data-testid="tl-handle-l"
                        onPointerDown={(e) => onHandleDown(e, "resize-l", card, list)}
                      />
                      {/* Center bar body — move */}
                      <div
                        className="bt-bar-content"
                        data-testid="tl-bar-body"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const startOff =
                            card.start !== undefined && card.start !== null
                              ? (parseDay(card.start, today) ?? parseDay(card.due, today) ?? 0)
                              : (parseDay(card.due, today) ?? 0);
                          const endOff = parseDay(card.due, today);
                          if (endOff === null) return;
                          setDrag({
                            cardId: card.id,
                            listId: list.id,
                            mode: "move",
                            initStart: startOff,
                            initEnd: endOff,
                            startX: e.clientX,
                          });
                        }}
                        onClick={() => {
                          if (!drag) onOpenCard?.(card, list.id);
                        }}
                      >
                        <span className="bt-bar-title">{card.title[lang]}</span>
                      </div>
                      {/* Right handle — resize-r */}
                      <div
                        className="bt-handle bt-handle-r"
                        data-testid="tl-handle-r"
                        onPointerDown={(e) => onHandleDown(e, "resize-r", card, list)}
                      />
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="bt-empty muted" data-testid="tl-empty">
                    {lang === "zh" ? "暂无卡片" : "No cards"}
                  </div>
                )}
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}
