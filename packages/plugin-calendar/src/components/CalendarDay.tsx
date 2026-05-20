import { toLocalIsoDate } from "./CalendarMini";
import type { CalendarEvent } from "../types";

export interface CalendarDayProps {
  date: string;
  events: readonly CalendarEvent[];
}

export function CalendarDay({ date, events }: CalendarDayProps) {
  const dayEvents = events
    .filter((event) => toLocalIsoDate(new Date(event.startsAt)) === date)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <strong>{new Date(`${date}T00:00:00`).toLocaleDateString()}</strong>
      <div style={{ display: "grid", gap: 6 }}>
        {dayEvents.length === 0 ? <span style={{ color: "#64748b" }}>No events</span> : null}
        {dayEvents.map((event) => (
          <article
            key={event.id}
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr",
              gap: 10,
              borderLeft: `4px solid ${event.color}`,
              padding: "8px 10px",
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <span style={{ color: "#64748b", fontSize: 12 }}>{formatTime(event.startsAt)}</span>
            <span>
              <strong>{event.title}</strong>
              <small style={{ display: "block", color: "#64748b" }}>{event.source}</small>
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
