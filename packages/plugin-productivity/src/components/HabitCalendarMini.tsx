import type { Habit } from "../types";

export interface HabitCalendarMiniProps {
  habit: Habit;
  days?: number;
}

function recentDates(days: number): string[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    return date.toISOString().slice(0, 10);
  });
}

export function HabitCalendarMini({ habit, days = 28 }: HabitCalendarMiniProps) {
  const counts = new Map(habit.history.map((entry) => [entry.date, entry.count]));
  return (
    <div
      aria-label={`${habit.name} history`}
      style={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(7, 14px)" }}
    >
      {recentDates(days).map((date) => {
        const count = counts.get(date) ?? 0;
        return (
          <span
            aria-label={`${date}: ${count} check-ins`}
            key={date}
            style={{
              background: count > 1 ? "#15803d" : count > 0 ? "#86efac" : "#e5e7eb",
              borderRadius: 3,
              height: 14,
              width: 14,
            }}
            title={`${date}: ${count}`}
          />
        );
      })}
    </div>
  );
}
