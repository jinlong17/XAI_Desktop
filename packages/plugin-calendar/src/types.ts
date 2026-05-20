import type { RepoRecord } from "@repo/core-data";

export type CalendarEventSource = "todo" | "pomodoro" | "habit" | "project" | "manual";

export interface CalendarEvent extends RepoRecord {
  entityType: "calendar.event";
  title: string;
  startsAt: string;
  endsAt: string;
  source: CalendarEventSource;
  color: string;
  version: number;
  deletedAt?: string;
}

export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface CalendarStoreState {
  events: CalendarEvent[];
  month: Date;
  selectedDate: string;
  refresh(): Promise<void>;
  setMonth(month: Date): void;
  selectDate(date: string): void;
}
