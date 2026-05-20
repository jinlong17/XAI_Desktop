import { toLocalIsoDate } from "../utils/date";
import type { CalendarEvent } from "../types";

const WEEKDAYS = [
  { label: "M", name: "Monday" },
  { label: "T", name: "Tuesday" },
  { label: "W", name: "Wednesday" },
  { label: "T", name: "Thursday" },
  { label: "F", name: "Friday" },
  { label: "S", name: "Saturday" },
  { label: "S", name: "Sunday" },
];

export interface CalendarMiniProps {
  month: Date;
  events: readonly CalendarEvent[];
  selectedDate?: string;
  onSelectDate?(date: string): void;
}

export function CalendarMini({ month, events, selectedDate, onSelectDate }: CalendarMiniProps) {
  const days = getMonthGrid(month);
  const eventDates = new Set(events.map((event) => toLocalIsoDate(new Date(event.startsAt))));

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <strong>
        {month.toLocaleString("default", { month: "long" })} {month.getFullYear()}
      </strong>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}>
        {WEEKDAYS.map((weekday) => (
          <abbr
            key={weekday.name}
            title={weekday.name}
            aria-label={weekday.name}
            style={{ color: "#64748b", fontSize: 11, textAlign: "center", textDecoration: "none" }}
          >
            {weekday.label}
          </abbr>
        ))}
        {days.map((day) => {
          const iso = toLocalIsoDate(day.date);
          const inMonth = day.date.getMonth() === month.getMonth();
          const selected = selectedDate === iso;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate?.(iso)}
              style={{
                minHeight: 30,
                border: selected ? "1px solid #2563eb" : "1px solid transparent",
                borderRadius: 6,
                background: selected ? "#dbeafe" : "transparent",
                color: inMonth ? "#172033" : "#94a3b8",
              }}
            >
              {day.date.getDate()}
              {eventDates.has(iso) ? <span style={{ display: "block", margin: "2px auto 0", width: 5, height: 5, borderRadius: 5, background: "#2563eb" }} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getMonthGrid(month: Date): { date: Date }[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(first.getTime());
  start.setDate(first.getDate() - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getTime());
    date.setDate(start.getDate() + index);
    return { date };
  });
}
