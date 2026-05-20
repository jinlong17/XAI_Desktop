import { useState } from "react";
import { usePomodoroStore } from "../hooks/usePomodoroStore";
import { useTodoStore } from "../hooks/useTodoStore";
import type { TodoStatus } from "../types";
import { TodoItem } from "./TodoItem";
import { TodoQuickAdd } from "./TodoQuickAdd";

const statusOptions: Array<TodoStatus | "all"> = ["all", "open", "in-progress", "done", "archived"];

export function TodoList() {
  const { todos, setStatus } = useTodoStore();
  const pomodoro = usePomodoroStore();
  const [filter, setFilter] = useState<TodoStatus | "all">("all");
  const visibleTodos = filter === "all" ? todos : todos.filter((todo) => todo.status === filter);

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <TodoQuickAdd />
      <div aria-label="Todo filters" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {statusOptions.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            style={{
              background: filter === option ? "#111827" : "#f3f4f6",
              border: 0,
              borderRadius: 6,
              color: filter === option ? "#ffffff" : "#374151",
              cursor: "pointer",
              padding: "6px 8px",
            }}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {visibleTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            onSelect={pomodoro.selectTodo}
            onStartPomodoro={(todoId) => pomodoro.start(todoId)}
            onToggle={(todoId) => {
              void setStatus(todoId, todo.status === "done" ? "open" : "done");
            }}
            selected={pomodoro.activeTodoId === todo.id}
            todo={todo}
          />
        ))}
      </div>
    </section>
  );
}
