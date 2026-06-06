/**
 * Read-only Board -> Calendar feed projection.
 *
 * Calendar remains the render owner. Board data remains owned by board-core and
 * is never copied into a Calendar storage key.
 */

import {
  getBoardCardDateMeta,
  readBoardStorage,
} from "@repo/plugin-web-board-core";
import type {
  Board,
  BoardCardData,
  BoardListData,
} from "@repo/plugin-web-board-core";
import type { CalEvent, CalEventsByDay } from "./sampleEvents.js";

export type CalendarEventsByDate = Record<string, CalEvent[]>;

function addEvent(
  eventsByDate: CalendarEventsByDate,
  dateKey: string,
  event: CalEvent,
): void {
  const existing = eventsByDate[dateKey] ?? [];
  eventsByDate[dateKey] = [...existing, event];
}

function boardEventDate(card: BoardCardData): string | null {
  const meta = getBoardCardDateMeta(card);
  return meta.dueDate ?? meta.startDate ?? null;
}

function boardCardToCalendarEvent(
  board: Board,
  list: BoardListData,
  card: BoardCardData,
): CalEvent | null {
  const dateKey = boardEventDate(card);
  if (!dateKey) return null;
  return {
    c: "blue",
    t: card.title,
    source: {
      type: "board-card",
      boardId: board.id,
      listId: list.id,
      cardId: card.id,
    },
  };
}

export function boardCalendarEventsByDate(rawBoards: unknown): CalendarEventsByDate {
  const read = readBoardStorage(rawBoards);
  if (read.status === "invalid") return {};

  const eventsByDate: CalendarEventsByDate = {};
  for (const board of read.boards) {
    for (const list of board.lists) {
      if (list.archived === true) continue;
      for (const card of list.cards) {
        if (card.archived === true) continue;
        const dateKey = boardEventDate(card);
        if (!dateKey) continue;
        const event = boardCardToCalendarEvent(board, list, card);
        if (event) addEvent(eventsByDate, dateKey, event);
      }
    }
  }
  return eventsByDate;
}

function dateKeyForMonthDay(year: number, month: number, day: number): string {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function dayFromDateKey(dateKey: string): number | null {
  const match = /^\d{4}-\d{2}-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const day = Number(match[1]);
  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : null;
}

function mergeDayEvents(
  baseEvents: readonly CalEvent[] | undefined,
  feedEvents: readonly CalEvent[] | undefined,
): CalEvent[] {
  return [...(baseEvents ?? []), ...(feedEvents ?? [])];
}

export function mergeEventsForMonth(
  baseEvents: CalEventsByDay,
  feedEventsByDate: CalendarEventsByDate,
  displayedMonth: { year: number; month: number },
): CalEventsByDay {
  const result: CalEventsByDay = {};
  for (let day = 1; day <= 31; day += 1) {
    const dateKey = dateKeyForMonthDay(displayedMonth.year, displayedMonth.month, day);
    result[day] = mergeDayEvents(baseEvents[day], feedEventsByDate[dateKey]);
  }
  return result;
}

export function mergeEventsForDateKeys(
  baseEvents: CalEventsByDay,
  feedEventsByDate: CalendarEventsByDate,
  dateKeys: readonly string[],
): CalEventsByDay {
  const result: CalEventsByDay = {};
  for (const dateKey of dateKeys) {
    const day = dayFromDateKey(dateKey);
    if (day === null) continue;
    result[day] = mergeDayEvents(baseEvents[day], feedEventsByDate[dateKey]);
  }
  return result;
}
