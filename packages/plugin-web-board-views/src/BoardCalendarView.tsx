/**
 * BoardCalendarView — month grid with HTML5 DnD-to-change-due.
 *
 * Hard constraint: card drop rewrites card.due via updateCard (same persistence
 * path as board-core, verbatim patch from prototype line 758).
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §4
 */

import { useState } from "react";
import type { BoardListData, BoardCardData } from "@repo/plugin-web-board-core";
import type { Lang } from "./internal/i18n.js";

export interface BoardCalendarViewProps {
  lists: readonly BoardListData[];
  lang: Lang;
  updateCard: (listId: string, cardId: string, patch: Partial<BoardCardData>) => void;
  onOpenCard?: (card: BoardCardData, listId: string) => void;
}

type DayEntry = { card: BoardCardData; list: BoardListData };

const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_ZH = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export function BoardCalendarView({
  lists,
  lang,
  updateCard,
  onOpenCard,
}: BoardCalendarViewProps) {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const todayDate = today.getDate();

  const firstDay = new Date(year, month, 1);
  // ISO week: Monday=0..Sunday=6
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build byDay map: day → list of {card, list}
  const byDay: Record<number, DayEntry[]> = {};
  lists.forEach((list) => {
    list.cards.forEach((card) => {
      if (!card.due) return;
      const due = card.due;
      let day: number | undefined;
      const m = String(due).match(/^(\d+)\/(\d+)/);
      if (m) {
        day = parseInt(m[2]!, 10);
      } else if (due === "Today" || due === "今天") {
        day = todayDate;
      }
      if (day !== undefined) {
        if (!byDay[day]) byDay[day] = [];
        byDay[day]!.push({ card, list });
      }
    });
  });

  const totalDueCards = Object.values(byDay).reduce(
    (n, arr) => n + arr.length,
    0,
  );

  const dayNames = lang === "zh" ? DAY_NAMES_ZH : DAY_NAMES_EN;
  const monthLabel =
    lang === "zh"
      ? `${year} 年 ${month + 1} 月`
      : firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Build cells array: null for padding, number for day
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  // DnD state
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const onDragEnd = () => {
    setDraggingId(null);
    setDragOverDay(null);
  };

  const onDragOverCell = (e: React.DragEvent<HTMLDivElement>, day: number | null) => {
    if (!day) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverDay !== day) setDragOverDay(day);
  };

  const onDragLeave = () => setDragOverDay(null);

  const onDropCell = (e: React.DragEvent<HTMLDivElement>, day: number | null) => {
    e.preventDefault();
    setDragOverDay(null);
    setDraggingId(null);
    if (!day) return;
    try {
      const payload = JSON.parse(e.dataTransfer.getData("text/plain")) as unknown;
      if (
        !payload ||
        typeof payload !== "object" ||
        !("cardId" in payload) ||
        !("listId" in payload) ||
        typeof (payload as Record<string, unknown>).cardId !== "string" ||
        typeof (payload as Record<string, unknown>).listId !== "string"
      ) {
        return; // malformed payload — silent no-op
      }
      const { cardId, listId } = payload as { cardId: string; listId: string };
      const newDue = `${month + 1}/${day}`;
      // Hard constraint: verbatim patch from prototype line 758
      updateCard(listId, cardId, { due: newDue, dueEn: undefined, dueLate: false });
    } catch {
      // malformed JSON — silent no-op
    }
  };

  return (
    <div className="board-cal panel" data-testid="board-cal">
      <header className="board-cal-head">
        <h2 data-testid="cal-month-label">{monthLabel}</h2>
        <span className="grow" />
        <span className="muted">
          {totalDueCards} {lang === "zh" ? "项有截止" : "with due dates"}
        </span>
      </header>
      <div className="board-cal-week">
        {dayNames.map((d, i) => (
          <div key={i} className="bcw" data-testid="cal-weekday">
            {d}
          </div>
        ))}
      </div>
      <div className="board-cal-grid" data-testid="cal-grid">
        {cells.map((d, i) => {
          const entries = d ? (byDay[d] ?? []) : [];
          return (
            <div
              key={i}
              className={
                "board-cal-cell" +
                (!d ? " empty" : "") +
                (d === todayDate ? " today" : "") +
                (d && dragOverDay === d ? " drag-over" : "")
              }
              data-day={d ?? undefined}
              data-testid={d ? `cal-cell-${d}` : undefined}
              onDragOver={(e) => onDragOverCell(e, d)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDropCell(e, d)}
            >
              {d !== null && (
                <div className="bcc-num">
                  {d === todayDate ? (
                    <span className="today-pill" data-testid="today-pill">
                      {d}
                    </span>
                  ) : (
                    d
                  )}
                </div>
              )}
              {d !== null && entries.length > 0 && (
                <div className="bcc-cards" data-list-id={entries[0]?.list.id}>
                  {entries.slice(0, 3).map(({ card, list }, ii) => (
                    <button
                      key={ii}
                      type="button"
                      className={"bcc-card" + (draggingId === card.id ? " dragging" : "")}
                      draggable
                      data-card-id={card.id}
                      data-list-id={list.id}
                      data-testid="cal-card"
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "text/plain",
                          JSON.stringify({ cardId: card.id, listId: list.id }),
                        );
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(card.id);
                      }}
                      onDragEnd={onDragEnd}
                      style={{
                        borderLeftColor: list.color
                          ? `var(--board-list-color-${list.color})`
                          : "var(--accent)",
                      }}
                      onClick={() => onOpenCard?.(card, list.id)}
                    >
                      {card.title[lang]}
                    </button>
                  ))}
                  {entries.length > 3 && (
                    <span className="bcc-more" data-testid="cal-more">
                      +{entries.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {totalDueCards === 0 && (
        <div className="bcal-empty" data-testid="cal-empty">
          {lang === "zh" ? "没有带截止日期的卡片" : "No cards with due dates"}
        </div>
      )}
    </div>
  );
}
