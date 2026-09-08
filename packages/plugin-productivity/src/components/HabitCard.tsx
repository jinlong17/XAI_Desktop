import { useHabitStore } from "../hooks/useHabitStore";
import type { Habit } from "../types";
import { HabitCalendarMini } from "./HabitCalendarMini";

export interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { checkIn } = useHabitStore();
  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        display: "grid",
        gap: 10,
        padding: 12,
      }}
    >
      <header style={{ alignItems: "center", display: "flex", gap: 10, justifyContent: "space-between" }}>
        <div>
          <strong>{habit.name}</strong>
          <span style={{ color: "#6b7280", display: "block", fontSize: 12 }}>{habit.frequency}</span>
        </div>
        <span style={{ fontWeight: 800 }}>{habit.streak}d</span>
      </header>
      <HabitCalendarMini habit={habit} />
      <button
        onClick={() => {
          void checkIn(habit.id);
        }}
        style={{
          background: "#16a34a",
          border: 0,
          borderRadius: 8,
          color: "#ffffff",
          cursor: "pointer",
          fontWeight: 700,
          minHeight: 34,
          padding: "0 10px",
        }}
        type="button"
      >
        Check in
      </button>
    </article>
  );
}
