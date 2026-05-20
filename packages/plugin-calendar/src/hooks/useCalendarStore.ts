import { useMemo, useState } from "react";
import { toLocalIsoDate } from "../components/CalendarMini";
import type { CalendarEvent, CalendarStoreState } from "../types";

export function useCalendarStore(seedEvents: CalendarEvent[] = createMockEvents()): CalendarStoreState {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, selectDate] = useState(toLocalIsoDate(today));

  return {
    events: seedEvents,
    month,
    selectedDate,
    setMonth,
    selectDate,
  };
}

export function createMockEvents(anchor = new Date()): CalendarEvent[] {
  const day = anchor.getDate();
  return [
    makeEvent("calendar-todo-1", "Write sprint review", day, 9, 30, "todo", "#2563eb"),
    makeEvent("calendar-pomodoro-1", "Deep work block", day, 11, 90, "pomodoro", "#7c3aed"),
    makeEvent("calendar-habit-1", "Workout streak", day + 1, 7, 45, "habit", "#16a34a"),
    makeEvent("calendar-project-1", "Prototype handoff", day + 3, 15, 60, "project", "#ea580c"),
  ];
}

function makeEvent(
  id: string,
  title: string,
  dateOffset: number,
  hour: number,
  durationMinutes: number,
  source: CalendarEvent["source"],
  color: string,
): CalendarEvent {
  const now = new Date();
  const starts = new Date(now.getFullYear(), now.getMonth(), dateOffset, hour, 0, 0, 0);
  const ends = new Date(starts.getTime() + durationMinutes * 60_000);
  const timestamp = new Date().toISOString();
  return {
    id,
    entityType: "calendar.event",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "device-local",
    title,
    startsAt: starts.toISOString(),
    endsAt: ends.toISOString(),
    source,
    color,
  };
}
