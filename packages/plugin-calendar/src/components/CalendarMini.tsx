import type { CalendarEvent } from "../types";

export interface CalendarMiniProps {
  month: Date;
  events: readonly CalendarEvent[];
  selectedDate?: string;
  onSelectDate?(date: string): void;
}

export function CalendarMini({ month, events, selectedDate, onSelectDate }: CalendarMiniProps) {
  const days = getMonthGrid(month);
  const eventDates = new Set(events.map((event) => event.startsAt.slice(0, 10)));

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <strong>
        {month.toLocaleString("default", { month: "long" })} {month.getFullYear()}
      </strong>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((label) => (
          <span key={label} style={{ color: "#64748b", fontSize: 11, textAlign: "center" }}>
            {label}
          </span>
        ))}
        {days.map((day) => {
          const iso = day.date.toISOString().slice(0, 10);
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
