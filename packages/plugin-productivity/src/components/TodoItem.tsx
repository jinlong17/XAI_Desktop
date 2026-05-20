import type { Todo } from "../types";

export interface TodoItemProps {
  todo: Todo;
  selected?: boolean;
  onToggle?: (todoId: string) => void;
  onSelect?: (todoId: string) => void;
  onStartPomodoro?: (todoId: string) => void;
}

const statusLabel: Record<Todo["status"], string> = {
  open: "Open",
  "in-progress": "Doing",
  done: "Done",
  archived: "Archived",
};

export function TodoItem({ todo, selected = false, onToggle, onSelect, onStartPomodoro }: TodoItemProps) {
  const done = todo.status === "done";
  return (
    <article
      aria-current={selected ? "true" : undefined}
      style={{
        background: selected ? "#eef2ff" : "#ffffff",
        border: `1px solid ${selected ? "#818cf8" : "#e5e7eb"}`,
        borderRadius: 8,
        display: "grid",
        gap: 8,
        padding: 10,
      }}
    >
      <div style={{ alignItems: "flex-start", display: "flex", gap: 8 }}>
        <input
          aria-label={`Mark ${todo.title} done`}
          checked={done}
          onChange={() => onToggle?.(todo.id)}
          style={{ marginTop: 3 }}
          type="checkbox"
        />
        <button
          onClick={() => onSelect?.(todo.id)}
          style={{
            background: "transparent",
            border: 0,
            cursor: "pointer",
            flex: 1,
            font: "inherit",
            minWidth: 0,
            padding: 0,
            textAlign: "left",
          }}
          type="button"
        >
          <strong style={{ display: "block", textDecoration: done ? "line-through" : "none" }}>{todo.title}</strong>
          {todo.description ? (
            <span style={{ color: "#6b7280", display: "block", fontSize: 12, marginTop: 3 }}>{todo.description}</span>
          ) : null}
        </button>
      </div>
      <footer style={{ alignItems: "center", color: "#6b7280", display: "flex", flexWrap: "wrap", fontSize: 12, gap: 8 }}>
        <span>{statusLabel[todo.status]}</span>
        <span>{todo.priority}</span>
        {todo.dueDate ? <time dateTime={todo.dueDate}>{todo.dueDate}</time> : null}
        <span>{todo.pomodoroCount} pomo</span>
        <button
          onClick={() => onStartPomodoro?.(todo.id)}
          style={{
            background: "#111827",
            border: 0,
            borderRadius: 6,
            color: "#ffffff",
            cursor: "pointer",
            fontSize: 12,
            marginLeft: "auto",
            padding: "5px 8px",
          }}
          type="button"
        >
          Start
        </button>
      </footer>
    </article>
  );
}
