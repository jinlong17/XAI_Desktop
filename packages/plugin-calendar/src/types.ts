import type { RepoRecord } from "@repo/core-data";

export type CalendarEventSource = "todo" | "pomodoro" | "habit" | "project" | "manual";

export interface CalendarEvent extends RepoRecord {
  entityType: "calendar.event";
  title: string;
  startsAt: string;
  endsAt: string;
  source: CalendarEventSource;
  color: string;
}

export interface CalendarStoreState {
  events: CalendarEvent[];
  month: Date;
  selectedDate: string;
  setMonth(month: Date): void;
  selectDate(date: string): void;
}
