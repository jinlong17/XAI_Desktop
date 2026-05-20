import { useState, type FormEvent } from "react";
import { useHabitStore } from "../hooks/useHabitStore";
import type { HabitFrequency } from "../types";
import { HabitCard } from "./HabitCard";

export function HabitList() {
  const { habits, createHabit } = useHabitStore();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    void createHabit({ name, frequency });
    setName("");
  };

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input
          aria-label="Habit name"
          onChange={(event) => setName(event.target.value)}
          placeholder="New habit"
          style={{ border: "1px solid #d1d5db", borderRadius: 8, flex: "1 1 200px", minHeight: 36, padding: "0 10px" }}
          value={name}
        />
        <select
          aria-label="Habit frequency"
          onChange={(event) => setFrequency(event.target.value as HabitFrequency)}
          style={{ border: "1px solid #d1d5db", borderRadius: 8, minHeight: 36, padding: "0 8px" }}
          value={frequency}
        >
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekly">Weekly</option>
        </select>
        <button type="submit">Add</button>
      </form>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {habits.map((habit) => (
          <HabitCard habit={habit} key={habit.id} />
        ))}
      </div>
    </section>
  );
}
