import { useEffect, useMemo, useRef } from "react";
import { usePomodoroStore } from "../hooks/usePomodoroStore";
import { useTodoStore } from "../hooks/useTodoStore";
import type { PomodoroMode } from "../types";

const modeLabel: Record<PomodoroMode, string> = {
  focus: "Focus",
  "short-break": "Short break",
  "long-break": "Long break",
};

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const seconds = Math.max(0, total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function PomodoroTimer() {
  const pomodoro = usePomodoroStore();
  const { todos, incrementPomodoro } = useTodoStore();
  const handledCompletion = useRef<string | null>(null);
  const activeTodo = pomodoro.activeTodoId ? todos.find((todo) => todo.id === pomodoro.activeTodoId) : null;
  const selectableTodos = useMemo(
    () => todos.filter((todo) => todo.status === "open" || todo.status === "in-progress"),
    [todos],
  );

  useEffect(() => {
    if (!pomodoro.lastCompletedAt || !pomodoro.lastCompletedTodoId) return;
    if (handledCompletion.current === pomodoro.lastCompletedAt) return;
    handledCompletion.current = pomodoro.lastCompletedAt;
    void incrementPomodoro(pomodoro.lastCompletedTodoId);
  }, [incrementPomodoro, pomodoro.lastCompletedAt, pomodoro.lastCompletedTodoId]);

  return (
    <section
      aria-label="Pomodoro timer"
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        display: "grid",
        gap: 12,
        padding: 14,
      }}
    >
      <header style={{ alignItems: "center", display: "flex", gap: 8, justifyContent: "space-between" }}>
        <div>
          <strong>{modeLabel[pomodoro.mode]}</strong>
          <span style={{ color: "#6b7280", display: "block", fontSize: 12 }}>
            {activeTodo ? activeTodo.title : "No task selected"}
          </span>
        </div>
        <span style={{ color: "#6b7280", fontSize: 12 }}>{pomodoro.cyclesCompleted} cycles</span>
      </header>
      <div style={{ fontSize: 42, fontVariantNumeric: "tabular-nums", fontWeight: 800, lineHeight: 1 }}>
        {formatSeconds(pomodoro.remainingSeconds)}
      </div>
      <select
        aria-label="Pomodoro task"
        onChange={(event) => pomodoro.selectTodo(event.target.value || null)}
        style={{ border: "1px solid #d1d5db", borderRadius: 8, minHeight: 36, padding: "0 8px" }}
        value={pomodoro.activeTodoId ?? ""}
      >
        <option value="">No task</option>
        {selectableTodos.map((todo) => (
          <option key={todo.id} value={todo.id}>
            {todo.title}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button onClick={() => pomodoro.start()} type="button">Start</button>
        <button onClick={pomodoro.pause} type="button">Pause</button>
        <button onClick={pomodoro.resume} type="button">Resume</button>
        <button onClick={() => pomodoro.reset()} type="button">Reset</button>
        <button onClick={pomodoro.skip} type="button">Skip</button>
      </div>
    </section>
  );
}
